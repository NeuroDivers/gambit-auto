
import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { EditInvoiceForm } from "@/components/invoices/sections/EditInvoiceForm"
import { useForm } from "react-hook-form"
import { InvoiceFormValues } from "@/components/invoices/types"
import { useInvoiceMutation } from "@/components/invoices/hooks/useInvoiceMutation"
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"
import { LoadingState } from "@/components/invoices/sections/LoadingState"

export default function EditInvoice() {
  const { id } = useParams<{ id: string }>()
  const form = useForm<InvoiceFormValues>()
  const { mutate: updateInvoice, isPending } = useInvoiceMutation(id)

  const { isLoading } = useQuery({
    queryKey: ["invoice", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          invoice_items (
            id,
            service_id,
            package_id,
            service_name,
            description,
            quantity,
            unit_price
          )
        `)
        .eq("id", id)
        .single()

      if (error) throw error
      
      // Set form values
      form.reset({
        status: data.status,
        notes: data.notes || "",
        due_date: data.due_date || null,
        customer_first_name: data.customer_first_name || "",
        customer_last_name: data.customer_last_name || "",
        customer_email: data.customer_email || "",
        customer_phone: data.customer_phone || "",
        customer_address: data.customer_address || "",
        vehicle_make: data.vehicle_make || "",
        vehicle_model: data.vehicle_model || "",
        vehicle_year: data.vehicle_year || 0,
        vehicle_vin: data.vehicle_vin || "",
        invoice_items: data.invoice_items?.map(item => ({
          service_id: item.service_id,
          package_id: item.package_id,
          service_name: item.service_name,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price
        })) || []
      })

      return data
    },
  })

  const onSubmit = (values: InvoiceFormValues) => {
    updateInvoice(values)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingState />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageBreadcrumbs />
      <div className="max-w-5xl mx-auto">
        <EditInvoiceForm
          form={form}
          onSubmit={onSubmit}
          isPending={isPending}
          invoiceId={id!}
        />
      </div>
    </div>
  )
}
