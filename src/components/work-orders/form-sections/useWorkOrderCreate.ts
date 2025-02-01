import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useQueryClient } from "@tanstack/react-query"
import type { WorkOrderFormValues } from "../WorkOrderFormFields"

export function useWorkOrderCreate() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const createWorkOrder = async (data: WorkOrderFormValues, mediaUrl: string | null) => {
    // Create new work order
    const { data: newWorkOrder, error: workOrderError } = await supabase
      .from("work_orders")
      .insert({
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
      .select()
      .single()

    if (workOrderError) throw workOrderError

    // Insert services only if we have a valid work order ID
    if (newWorkOrder?.id) {
      const { error: servicesError } = await supabase
        .from("work_order_services")
        .insert(
          data.service_ids.map(serviceId => ({
            work_order_id: newWorkOrder.id,
            service_id: serviceId
          }))
        )

      if (servicesError) throw servicesError
    }

    toast({
      title: "Success",
      description: "Your work order has been submitted successfully.",
    })

    queryClient.invalidateQueries({ queryKey: ["workOrders"] })
    
    return newWorkOrder
  }

  return { createWorkOrder }
}