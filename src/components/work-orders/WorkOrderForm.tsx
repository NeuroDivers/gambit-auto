import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useWorkOrderForm } from "./form/useWorkOrderForm"
import { FormFields } from "./form-fields/FormFields"
import { useWorkOrderSubmit } from "./form/useWorkOrderSubmit"
import type { WorkOrder } from "./types"
import type { QuoteRequest } from "../quotes/types"

type WorkOrderFormProps = {
  workOrder?: WorkOrder
  quoteRequest?: QuoteRequest
  selectedDate?: Date
  onSuccess?: () => void
}

export function WorkOrderForm({ workOrder, quoteRequest, selectedDate, onSuccess }: WorkOrderFormProps) {
  const requestId = workOrder?.quote_request_id || quoteRequest?.id

  const { data: selectedServices = [] } = useQuery({
    queryKey: ["workOrderServices", requestId],
    enabled: !!requestId, // Only run query when we have a valid ID
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quote_request_services")
        .select("service_id")
        .eq("quote_request_id", requestId)
      
      if (error) throw error
      return data?.map(service => service.service_id) ?? []
    },
    initialData: []
  })
  
  const form = useWorkOrderForm({ 
    selectedDate, 
    workOrder,
    quoteRequest,
    selectedServices
  })

  const { handleSubmit } = useWorkOrderSubmit({
    workOrder,
    quoteRequest,
    onSuccess
  })

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <FormFields form={form} />
    </form>
  )
}