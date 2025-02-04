import { useForm } from "react-hook-form"
import { EditInvoiceForm } from './sections/EditInvoiceForm'
import { InvoicePrintPreview } from './sections/InvoicePrintPreview'
import { InvoiceFormValues } from "./types"
import { useInvoiceData } from "./hooks/useInvoiceData"
import { useInvoiceMutation } from "./hooks/useInvoiceMutation"
import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

type InvoiceViewProps = {
  invoiceId?: string
  isEditing?: boolean
}

export function InvoiceView({ invoiceId, isEditing }: InvoiceViewProps) {
  const { data: invoice, isLoading: isInvoiceLoading } = useInvoiceData(invoiceId)
  const updateInvoiceMutation = useInvoiceMutation(invoiceId)

  // Also fetch business profile data which is needed for the invoice
  const { data: businessProfile, isLoading: isBusinessLoading } = useQuery({
    queryKey: ["business-profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_profile")
        .select("*")
        .limit(1)
        .maybeSingle()

      if (error) throw error
      return data
    },
  })

  const form = useForm<InvoiceFormValues>({
    defaultValues: {
      notes: '',
      status: 'draft',
      invoice_items: [],
      customer_first_name: '',
      customer_last_name: '',
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
        customer_first_name: invoice.customer_first_name || '',
        customer_last_name: invoice.customer_last_name || '',
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

  // Show loading state while either invoice or business profile data is loading
  if (isInvoiceLoading || isBusinessLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-32 bg-muted rounded" />
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded w-2/3" />
              <div className="h-20 bg-muted rounded" />
            </div>
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded w-2/3" />
              <div className="h-20 bg-muted rounded" />
            </div>
          </div>
        </div>
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

  return <InvoicePrintPreview invoice={invoice} businessProfile={businessProfile} />
}