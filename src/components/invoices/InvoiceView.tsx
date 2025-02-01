import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { EditInvoiceForm } from './sections/EditInvoiceForm'
import { InvoicePrintPreview } from './sections/InvoicePrintPreview'
import { useForm } from "react-hook-form"
import { InvoiceFormValues } from "./types"
import { useEffect } from "react"

type InvoiceViewProps = {
  invoiceId?: string
  isEditing?: boolean
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
        .maybeSingle()

      if (error) throw error
      return data
    },
    enabled: !!invoiceId
  })

  const form = useForm<InvoiceFormValues>({
    defaultValues: {
      notes: '',
      status: 'draft',
      invoice_items: [],
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      customer_address: '',
      vehicle_make: '',
      vehicle_model: '',
      vehicle_year: 0,
      vehicle_vin: ''
    }
  })

  // Update form when invoice data is loaded
  useEffect(() => {
    if (invoice) {
      form.reset({
        notes: invoice.notes || '',
        status: invoice.status || 'draft',
        invoice_items: invoice.invoice_items || [],
        customer_name: invoice.customer_name || '',
        customer_email: invoice.customer_email || '',
        customer_phone: invoice.customer_phone || '',
        customer_address: invoice.customer_address || '',
        vehicle_make: invoice.vehicle_make || '',
        vehicle_model: invoice.vehicle_model || '',
        vehicle_year: invoice.vehicle_year || 0,
        vehicle_vin: invoice.vehicle_vin || ''
      })
    }
  }, [invoice, form])

  const updateInvoiceMutation = useMutation({
    mutationFn: async (values: InvoiceFormValues) => {
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({
          notes: values.notes,
          status: values.status,
          customer_name: values.customer_name,
          customer_email: values.customer_email,
          customer_phone: values.customer_phone,
          customer_address: values.customer_address,
          vehicle_make: values.vehicle_make,
          vehicle_model: values.vehicle_model,
          vehicle_year: values.vehicle_year,
          vehicle_vin: values.vehicle_vin
        })
        .eq('id', invoiceId)

      if (invoiceError) throw invoiceError

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