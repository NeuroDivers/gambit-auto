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

    // Insert services and their assignments
    if (newWorkOrder?.id) {
      // First insert work order services
      const { data: workOrderServices, error: servicesError } = await supabase
        .from("work_order_services")
        .insert(
          data.service_ids.map(serviceId => ({
            work_order_id: newWorkOrder.id,
            service_id: serviceId
          }))
        )
        .select('id, service_id')

      if (servicesError) throw servicesError

      // Then insert sidekick assignments if any
      if (data.sidekick_assignments && workOrderServices) {
        const assignments = workOrderServices
          .filter(service => data.sidekick_assignments?.[service.service_id])
          .map(service => ({
            work_order_service_id: service.id,
            sidekick_id: data.sidekick_assignments![service.service_id]
          }))

        if (assignments.length > 0) {
          const { error: assignmentError } = await supabase
            .from("work_order_service_assignments")
            .insert(assignments)

          if (assignmentError) throw assignmentError
        }
      }
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