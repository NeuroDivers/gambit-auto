import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import type { WorkOrderFormValues } from "../types/form"

export function useWorkOrderSubmit({ 
  workOrder,
  onSuccess
}: {
  workOrder?: any
  onSuccess?: () => void
}) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const handleSubmit = async (values: WorkOrderFormValues) => {
    try {
      const startDateTime = new Date(`${values.start_date}T${values.start_time}`).toISOString()
      const endDateTime = new Date(`${values.end_date}T${values.end_time}`).toISOString()

      const workOrderData = {
        quote_request_id: values.quote_request_id,
        assigned_bay_id: values.assigned_bay_id,
        start_date: startDateTime,
        end_date: endDateTime,
        status: values.status,
        notes: values.notes,
      }

      if (workOrder) {
        // Update existing work order
        const { error } = await supabase
          .from("work_orders")
          .update(workOrderData)
          .eq('id', workOrder.id)

        if (error) throw error

        // Update services
        const { error: deleteError } = await supabase
          .from("quote_request_services")
          .delete()
          .eq("quote_request_id", workOrder.quote_request_id)

        if (deleteError) throw deleteError

        const { error: servicesError } = await supabase
          .from("quote_request_services")
          .insert(
            values.service_ids.map(serviceId => ({
              quote_request_id: workOrder.quote_request_id,
              service_id: serviceId
            }))
          )

        if (servicesError) throw servicesError

      } else {
        // Create new work order
        const { data: newWorkOrder, error } = await supabase
          .from("work_orders")
          .insert([workOrderData])
          .select()
          .single()

        if (error) throw error

        // Insert services
        const { error: servicesError } = await supabase
          .from("quote_request_services")
          .insert(
            values.service_ids.map(serviceId => ({
              quote_request_id: newWorkOrder.quote_request_id,
              service_id: serviceId
            }))
          )

        if (servicesError) throw servicesError
      }

      toast({
        title: "Success",
        description: workOrder ? "Work order updated successfully" : "Work order created successfully",
      })

      queryClient.invalidateQueries({ queryKey: ["workOrders"] })
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