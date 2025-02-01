import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { EditInvoiceForm } from './sections/EditInvoiceForm'
import { InvoicePrintPreview } from './sections/InvoicePrintPreview'
import { useForm } from "react-hook-form"

type InvoiceViewProps = {
  invoiceId?: string
  isEditing?: boolean
}

type FormValues = {
  notes: string
  status: string
  invoice_items: Array<{
    service_name: string
    description: string
    quantity: number
    unit_price: number
  }>
}

export function InvoiceView({ invoiceId, isEditing }: InvoiceViewProps) {
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
          ),
          invoice_items (*)
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
      status: invoice?.status || 'draft',
      invoice_items: invoice?.invoice_items || []
    }
  })

  const updateInvoiceMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      // Update invoice
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({
          notes: values.notes,
          status: values.status
        })
        .eq('id', invoiceId)

      if (invoiceError) throw invoiceError

      // Update invoice items
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .upsert(
          values.invoice_items.map(item => ({
            invoice_id: invoiceId,
            ...item
          }))
        )

      if (itemsError) throw itemsError
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
      <EditInvoiceForm 
        form={form} 
        onSubmit={(values) => updateInvoiceMutation.mutate(values)}
        isPending={updateInvoiceMutation.isPending}
        invoiceId={invoiceId || ''}
      />
    )
  }

  return <InvoicePrintPreview invoice={invoice} />
}