import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

type UseInvoiceFormSubmissionProps = {
  onSuccess?: () => void
  selectedWorkOrderId: string
  customerFirstName: string
  customerLastName: string
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

async function createWorkOrder(data: Partial<UseInvoiceFormSubmissionProps>) {
  const { data: workOrder, error } = await supabase
    .from("work_orders")
    .insert({
      first_name: data.customerFirstName,
      last_name: data.customerLastName,
      email: data.customerEmail,
      phone_number: data.customerPhone,
      contact_preference: "email",
      vehicle_make: data.vehicleMake,
      vehicle_model: data.vehicleModel,
      vehicle_year: data.vehicleYear,
      vehicle_serial: data.vehicleVin,
      status: "completed"
    })
    .select()
    .single()

  if (error) throw error
  return workOrder
}

async function createInvoice(workOrderId: string) {
  const { data: invoice, error } = await supabase
    .rpc('create_invoice_from_work_order', {
      work_order_id: workOrderId
    })

  if (error) throw error
  return invoice
}

async function updateInvoice(invoiceId: string, data: Partial<UseInvoiceFormSubmissionProps>) {
  const { error } = await supabase
    .from("invoices")
    .update({
      customer_first_name: data.customerFirstName,
      customer_last_name: data.customerLastName,
      customer_email: data.customerEmail,
      customer_address: data.customerAddress,
      vehicle_make: data.vehicleMake,
      vehicle_model: data.vehicleModel,
      vehicle_year: data.vehicleYear,
      vehicle_vin: data.vehicleVin,
      company_name: data.businessProfile?.company_name || null,
      company_phone: data.businessProfile?.phone_number || null,
      company_email: data.businessProfile?.email || null,
      company_address: data.businessProfile?.address || null,
      gst_number: data.businessTaxes?.find(tax => tax.tax_type === 'GST')?.tax_number || null,
      qst_number: data.businessTaxes?.find(tax => tax.tax_type === 'QST')?.tax_number || null,
    })
    .eq("id", invoiceId)

  if (error) throw error
}

async function createInvoiceItems(invoiceId: string, items: any[]) {
  if (items.length === 0) return

  const { error } = await supabase
    .from("invoice_items")
    .insert(
      items.map(item => ({
        invoice_id: invoiceId,
        service_name: item.service_name,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }))
    )

  if (error) throw error
}

export function useInvoiceFormSubmission(props: UseInvoiceFormSubmissionProps) {
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      let workOrderId = props.selectedWorkOrderId
      
      if (!workOrderId) {
        const workOrder = await createWorkOrder(props)
        workOrderId = workOrder.id
      }

      const invoice = await createInvoice(workOrderId)
      await updateInvoice(invoice, props)
      await createInvoiceItems(invoice, props.invoiceItems)

      toast({
        title: "Success",
        description: "Invoice created successfully",
      })

      props.onSuccess?.()
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