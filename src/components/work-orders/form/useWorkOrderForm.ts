import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import type { WorkOrderFormValues } from "../WorkOrderForm"
import type { WorkOrder } from "../types/work-order"
import type { QuoteRequest } from "../../quotes/types"

interface UseWorkOrderFormProps {
  selectedDate?: Date
  workOrder?: WorkOrder
  quoteRequest?: QuoteRequest
}

export function useWorkOrderForm({ 
  selectedDate, 
  workOrder,
  quoteRequest,
}: UseWorkOrderFormProps) {
  const defaultValues: Partial<WorkOrderFormValues> = {
    assigned_bay_id: workOrder?.assigned_bay_id || "",
    start_date: workOrder ? format(new Date(workOrder.start_date), "yyyy-MM-dd") 
      : selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    start_time: workOrder ? format(new Date(workOrder.start_date), "HH:mm") : undefined,
    end_date: workOrder ? format(new Date(workOrder.end_date), "yyyy-MM-dd") : undefined,
    end_time: workOrder ? format(new Date(workOrder.end_date), "HH:mm") : undefined,
    status: (workOrder?.status as WorkOrderFormValues['status']) || "pending",
    notes: workOrder?.notes || "",
    service_ids: [],
  }

  return useForm<WorkOrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  })
}