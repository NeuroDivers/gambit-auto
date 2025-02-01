import { useForm } from "react-hook-form"
import { EditInvoiceForm } from './sections/EditInvoiceForm'
import { InvoicePrintPreview } from './sections/InvoicePrintPreview'
import { InvoiceFormValues } from "./types"
import { useInvoiceData } from "./hooks/useInvoiceData"
import { useInvoiceMutation } from "./hooks/useInvoiceMutation"
import { useEffect } from "react"

type InvoiceViewProps = {
  invoiceId?: string
  isEditing?: boolean
}

export function InvoiceView({ invoiceId, isEditing }: InvoiceViewProps) {
  const { data: invoice, isLoading } = useInvoiceData(invoiceId)
  const updateInvoiceMutation = useInvoiceMutation(invoiceId)

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