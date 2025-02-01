import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useQueryClient } from "@tanstack/react-query"
import type { WorkOrderFormValues } from "../WorkOrderFormFields"

export function useWorkOrderUpdate() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const updateWorkOrder = async (
    workOrderId: string, 
    data: WorkOrderFormValues, 
    mediaUrl: string | null
  ) => {
    // Update existing work order
    const { error: workOrderError } = await supabase
      .from("work_orders")
      .update({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone_number: data.phone_number,
        contact_preference: data.contact_preference,
        vehicle_make: data.vehicle_make,
        vehicle_model: data.vehicle_model,
        vehicle_year: data.vehicle_year,
        vehicle_serial: data.vehicle_serial,
        additional_notes: data.additional_notes,
        media_url: mediaUrl,
        timeframe: data.timeframe,
        price: data.price,
        address: data.address // Add this line to save the address
      })
      .eq("id", workOrderId)

    if (workOrderError) throw workOrderError

    // Update services - first delete existing ones
    const { error: deleteError } = await supabase
      .from("work_order_services")
      .delete()
      .eq("work_order_id", workOrderId)

    if (deleteError) throw deleteError

    // Insert new services with quantity and unit price
    if (data.service_items.length > 0) {
      const { error: servicesError } = await supabase
        .from("work_order_services")
        .insert(
          data.service_items.map(item => ({
            work_order_id: workOrderId,
            service_id: item.service_id,
            quantity: item.quantity,
            unit_price: item.unit_price
          }))
        )

      if (servicesError) throw servicesError
    }

    toast({
      title: "Success",
      description: "Work order has been updated successfully.",
    })

    queryClient.invalidateQueries({ queryKey: ["workOrders"] })
  }

  return { updateWorkOrder }
}