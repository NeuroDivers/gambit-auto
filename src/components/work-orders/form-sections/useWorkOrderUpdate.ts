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
      })
      .eq("id", workOrderId)

    if (workOrderError) throw workOrderError

    // Update services
    const { error: deleteError } = await supabase
      .from("work_order_services")
      .delete()
      .eq("work_order_id", workOrderId)

    if (deleteError) throw deleteError

    const { error: servicesError } = await supabase
      .from("work_order_services")
      .insert(
        data.service_ids.map(serviceId => ({
          work_order_id: workOrderId,
          service_id: serviceId
        }))
      )

    if (servicesError) throw servicesError

    toast({
      title: "Success",
      description: "Work order has been updated successfully.",
    })

    queryClient.invalidateQueries({ queryKey: ["workOrders"] })
  }

  return { updateWorkOrder }
}