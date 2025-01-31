import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { workOrderFormSchema, type WorkOrderFormValues } from "../types"
import { useEffect } from "react"

export function useWorkOrderForm({ 
  selectedDate, 
  workOrder, 
  quoteRequest 
}: { 
  selectedDate?: Date
  workOrder?: any
  quoteRequest?: any
}) {
  const form = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      quote_request_id: workOrder?.quote_request_id || quoteRequest?.id,
      assigned_bay_id: workOrder?.assigned_bay_id || "",
      start_date: workOrder ? format(new Date(workOrder.start_date), "yyyy-MM-dd") 
        : selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      start_time: workOrder ? format(new Date(workOrder.start_date), "HH:mm")
        : "08:00",
      end_date: workOrder ? format(new Date(workOrder.end_date), "yyyy-MM-dd")
        : selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      end_time: workOrder ? format(new Date(workOrder.end_date), "HH:mm")
        : "18:00",
      status: workOrder?.status as WorkOrderFormValues['status'] || "pending",
      notes: workOrder?.notes || "",
    },
  })

  useEffect(() => {
    if (selectedDate) {
      form.setValue('start_date', format(selectedDate, "yyyy-MM-dd"))
      form.setValue('end_date', format(selectedDate, "yyyy-MM-dd"))
    }
  }, [selectedDate, form])

  return form
}