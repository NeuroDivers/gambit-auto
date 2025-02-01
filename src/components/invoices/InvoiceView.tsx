import { useReactToPrint } from 'react-to-print'
import { useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { InvoiceCard } from "./sections/InvoiceCard"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { InvoiceActions } from './sections/InvoiceActions'
import { InvoiceEditForm } from './sections/InvoiceEditForm'

type InvoiceViewProps = {
  invoiceId?: string
  isEditing?: boolean
}

type FormValues = {
  notes: string
  status: string
}

export function InvoiceView({ invoiceId, isEditing }: InvoiceViewProps) {
  const componentRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  const { data: invoice, isLoading } = useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          work_order:work_orders (
            *,
            services:work_order_services (
              *,
              service:service_types (*)
            )
          )
        `)
        .eq('id', invoiceId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!invoiceId
  })

  const form = useForm<FormValues>({
    defaultValues: {
      notes: invoice?.notes || '',
      status: invoice?.status || 'draft'
    }
  })

  const updateInvoiceMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const { error } = await supabase
        .from('invoices')
        .update(values)
        .eq('id', invoiceId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] })
      toast.success('Invoice updated successfully')
    },
    onError: (error) => {
      toast.error('Failed to update invoice')
      console.error('Error updating invoice:', error)
    }
  })

  const handlePrint = useReactToPrint({
    documentTitle: `Invoice-${invoice?.invoice_number}`,
    onAfterPrint: () => console.log('Printed successfully'),
    pageStyle: "@page { size: auto; margin: 0mm; }",
    content: () => componentRef.current,
  })

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="h-32 bg-muted rounded" />
      </div>
    )
  }

  if (isEditing) {
    return (
      <InvoiceEditForm 
        form={form} 
        onSubmit={(values) => updateInvoiceMutation.mutate(values)}
        isPending={updateInvoiceMutation.isPending}
      />
    )
  }

  return (
    <div className="w-full max-w-[1000px] mx-auto space-y-6 p-6">
      <InvoiceActions 
        invoiceId={invoiceId} 
        onPrint={() => handlePrint()}
      />
      <div ref={componentRef} className="bg-white rounded-lg shadow-lg p-8">
        <InvoiceCard invoice={invoice} />
      </div>
    </div>
  )
}