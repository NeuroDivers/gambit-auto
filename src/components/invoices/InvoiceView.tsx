import { useReactToPrint } from 'react-to-print'
import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { PrintButton } from "./sections/PrintButton"
import { InvoiceCard } from "./sections/InvoiceCard"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Mail, Printer } from "lucide-react"
import { format } from 'date-fns'
import { InvoiceForm } from './form/InvoiceForm'

type InvoiceViewProps = {
  invoiceId?: string
  isEditing?: boolean
}

export function InvoiceView({ invoiceId, isEditing }: InvoiceViewProps) {
  const componentRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()
  const [isSending, setIsSending] = useState(false)

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

  const updateInvoiceMutation = useMutation({
    mutationFn: async (values: any) => {
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
    onBeforePrint: () => {
      if (componentRef.current) {
        componentRef.current.style.background = 'white'
      }
      return Promise.resolve()
    }
  })

  const handleSendEmail = async () => {
    try {
      setIsSending(true)
      const { error } = await supabase.functions.invoke('send-invoice-email', {
        body: { invoiceId }
      })
      
      if (error) throw error
      
      toast.success('Invoice sent successfully')
    } catch (error) {
      console.error('Error sending invoice:', error)
      toast.error('Failed to send invoice')
    } finally {
      setIsSending(false)
    }
  }

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
      <InvoiceForm
        defaultValues={{
          notes: invoice?.notes || '',
          status: invoice?.status || 'draft',
          invoice_number: invoice?.invoice_number || '',
          due_date: invoice?.due_date ? format(new Date(invoice.due_date), 'yyyy-MM-dd') : '',
          subtotal: invoice?.subtotal || 0,
          tax_amount: invoice?.tax_amount || 0,
          total: invoice?.total || 0
        }}
        onSubmit={(values) => updateInvoiceMutation.mutate(values)}
        isSubmitting={updateInvoiceMutation.isPending}
      />
    )
  }

  return (
    <div className="w-full max-w-[1000px] mx-auto space-y-6 p-6">
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={handleSendEmail}
          disabled={isSending}
          className="gap-2"
        >
          <Mail className="h-4 w-4" />
          {isSending ? 'Sending...' : 'Send Email'}
        </Button>
        <Button 
          onClick={() => handlePrint()}
          className="gap-2"
        >
          <Printer className="h-4 w-4" />
          Print Invoice
        </Button>
      </div>
      <div ref={componentRef} className="bg-white rounded-lg shadow-lg p-8">
        <InvoiceCard invoice={invoice} />
      </div>
    </div>
  )
}