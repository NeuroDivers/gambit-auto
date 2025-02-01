import { Button } from "@/components/ui/button"
import { WorkOrder } from "../types"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"

type WorkOrderCardActionsProps = {
  request: WorkOrder
}

export function WorkOrderCardActions({ request }: WorkOrderCardActionsProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const updateStatus = async (status: string) => {
    try {
      const { error } = await supabase
        .from("work_orders")
        .update({ status })
        .eq("id", request.id)

      if (error) throw error

      toast({
        title: "Success",
        description: `Work order marked as ${status}`,
      })

      queryClient.invalidateQueries({ queryKey: ["workOrders"] })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const createInvoice = async () => {
    try {
      const { data: businessProfile, error: businessError } = await supabase
        .from("business_profile")
        .select("*")
        .limit(1)
        .maybeSingle()

      if (businessError) throw businessError

      const { data: businessTaxes, error: taxesError } = await supabase
        .from("business_taxes")
        .select("*")

      if (taxesError) throw taxesError

      const { data: invoice, error: invoiceError } = await supabase
        .rpc('create_invoice_from_work_order', {
          work_order_id: request.id
        })

      if (invoiceError) throw invoiceError

      const { data: workOrderServices, error: servicesError } = await supabase
        .from("work_order_services")
        .select(`
          quantity,
          unit_price,
          service_types (
            name
          )
        `)
        .eq("work_order_id", request.id)

      if (servicesError) throw servicesError

      if (workOrderServices && workOrderServices.length > 0) {
        const invoiceItems = workOrderServices.map(service => ({
          invoice_id: invoice,
          service_name: service.service_types?.name || '',
          description: service.service_types?.name || '',
          quantity: service.quantity,
          unit_price: service.unit_price
        }))

        const { error: itemsError } = await supabase
          .from("invoice_items")
          .insert(invoiceItems)

        if (itemsError) throw itemsError
      }

      const { error: updateError } = await supabase
        .from("invoices")
        .update({
          customer_name: `${request.first_name} ${request.last_name}`,
          customer_email: request.email,
          customer_phone: request.phone_number,
          customer_address: request.address,
          vehicle_make: request.vehicle_make,
          vehicle_model: request.vehicle_model,
          vehicle_year: request.vehicle_year,
          vehicle_vin: request.vehicle_serial,
          company_name: businessProfile?.company_name || null,
          company_phone: businessProfile?.phone_number || null,
          company_email: businessProfile?.email || null,
          company_address: businessProfile?.address || null,
          gst_number: businessTaxes?.find(tax => tax.tax_type === 'GST')?.tax_number || null,
          qst_number: businessTaxes?.find(tax => tax.tax_type === 'QST')?.tax_number || null,
        })
        .eq("id", invoice)

      if (updateError) throw updateError

      toast({
        title: "Success",
        description: "Invoice created successfully",
      })

      navigate(`/invoices/${invoice}`)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (request.status === "pending") {
    return (
      <div className="flex gap-2 justify-end pt-3 border-t border-border/20">
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateStatus("rejected")}
          className="hover:bg-destructive/20"
        >
          Reject
        </Button>
        <Button
          size="sm"
          onClick={() => updateStatus("approved")}
          className="hover:bg-primary/20"
        >
          Approve
        </Button>
      </div>
    )
  }

  if (request.status === "completed") {
    return (
      <div className="flex justify-end pt-3 border-t border-border/20">
        <Button
          size="sm"
          onClick={createInvoice}
          className="hover:bg-primary/20"
        >
          Convert to Invoice
        </Button>
      </div>
    )
  }

  return null
}
