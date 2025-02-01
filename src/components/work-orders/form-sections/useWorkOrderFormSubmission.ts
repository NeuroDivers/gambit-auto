import { useToast } from "@/hooks/use-toast"
import type { WorkOrderFormValues } from "../types"
import { useWorkOrderCreate } from "./useWorkOrderCreate"
import { useWorkOrderUpdate } from "./useWorkOrderUpdate"

type UseWorkOrderFormSubmissionProps = {
  initialData?: {
    id: string
    media_url?: string | null
  }
  mediaUrl: string | null
  onSuccess?: () => void
}

export function useWorkOrderFormSubmission({ 
  initialData, 
  mediaUrl,
  onSuccess 
}: UseWorkOrderFormSubmissionProps) {
  const { toast } = useToast()
  const { createWorkOrder } = useWorkOrderCreate()
  const { updateWorkOrder } = useWorkOrderUpdate()

  const handleSubmit = async (data: WorkOrderFormValues) => {
    try {
      if (initialData?.id) {
        await updateWorkOrder(initialData.id, data, mediaUrl)
      } else {
        await createWorkOrder(data, mediaUrl)
      }
      onSuccess?.()
    } catch (error: any) {
      console.error("Error submitting work order:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to submit work order",
        variant: "destructive",
      })
    }
  }

  return { handleSubmit }
}