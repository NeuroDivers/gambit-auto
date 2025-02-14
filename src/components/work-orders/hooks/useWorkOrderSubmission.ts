
import { WorkOrderFormValues } from "../types"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { createWorkOrder } from "./work-order-mutations/createWorkOrder"
import { updateWorkOrder } from "./work-order-mutations/updateWorkOrder"

export function useWorkOrderSubmission() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const submitWorkOrder = async (values: WorkOrderFormValues, workOrderId?: string) => {
    try {
      console.log("Submitting work order with values:", values)
      
      if (workOrderId) {
        await updateWorkOrder(workOrderId, values)
      } else {
        await createWorkOrder(values)
      }

      await queryClient.invalidateQueries({ queryKey: ["workOrder", workOrderId] })
      await queryClient.invalidateQueries({ queryKey: ["workOrders"] })
      
      toast({
        title: "Success",
        description: workOrderId ? "Work order updated successfully" : "Work order created successfully",
      })

      return true
    } catch (error: any) {
      console.error("Error saving work order:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save work order",
      })
      return false
    }
  }

  return { submitWorkOrder }
}
