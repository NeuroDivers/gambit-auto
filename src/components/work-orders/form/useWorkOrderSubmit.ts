import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import type { WorkOrderFormValues } from "../types"

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
        const { error } = await supabase
          .from("work_orders")
          .update(workOrderData)
          .eq('id', workOrder.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from("work_orders")
          .insert([workOrderData])

        if (error) throw error
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