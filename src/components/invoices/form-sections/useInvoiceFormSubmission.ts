import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

type UseInvoiceFormSubmissionProps = {
  onSuccess?: () => void
  selectedWorkOrderId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  vehicleMake: string
  vehicleModel: string
  vehicleYear: number
  vehicleVin: string
  invoiceItems: any[]
  businessProfile: any
  businessTaxes: any[]
}

export function useInvoiceFormSubmission({
  onSuccess,
  selectedWorkOrderId,
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  vehicleMake,
  vehicleModel,
  vehicleYear,
  vehicleVin,
  invoiceItems,
  businessProfile,
  businessTaxes
}: UseInvoiceFormSubmissionProps) {
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      let workOrderId = selectedWorkOrderId
      
      if (!workOrderId) {
        const { data: workOrder, error: workOrderError } = await supabase
          .from("work_orders")
          .insert({
            first_name: customerName.split(" ")[0] || "",
            last_name: customerName.split(" ")[1] || "",
            email: customerEmail,
            phone_number: customerPhone,
            contact_preference: "email",
            vehicle_make: vehicleMake,
            vehicle_model: vehicleModel,
            vehicle_year: vehicleYear,
            vehicle_serial: vehicleVin,
            status: "completed"
          })
          .select()
          .single()

        if (workOrderError) throw workOrderError
        workOrderId = workOrder.id
      }

      const { data: invoice, error: invoiceError } = await supabase
        .rpc('create_invoice_from_work_order', {
          work_order_id: workOrderId
        })

      if (invoiceError) throw invoiceError

      const { error: updateError } = await supabase
        .from("invoices")
        .update({
          customer_name: customerName,
          customer_email: customerEmail,
          customer_address: customerAddress,
          vehicle_make: vehicleMake,
          vehicle_model: vehicleModel,
          vehicle_year: vehicleYear,
          vehicle_vin: vehicleVin,
          company_name: businessProfile?.company_name || null,
          company_phone: businessProfile?.phone_number || null,
          company_email: businessProfile?.email || null,
          company_address: businessProfile?.address || null,
          gst_number: businessTaxes?.find(tax => tax.tax_type === 'GST')?.tax_number || null,
          qst_number: businessTaxes?.find(tax => tax.tax_type === 'QST')?.tax_number || null,
        })
        .eq("id", invoice)

      if (updateError) throw updateError

      if (invoiceItems.length > 0) {
        const { error: itemsError } = await supabase
          .from("invoice_items")
          .insert(
            invoiceItems.map(item => ({
              invoice_id: invoice,
              service_name: item.service_name,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
            }))
          )

        if (itemsError) throw itemsError
      }

      toast({
        title: "Success",
        description: "Invoice created successfully",
      })

      onSuccess?.()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return { handleSubmit }
}