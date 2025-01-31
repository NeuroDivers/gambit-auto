import { z } from "zod"

export const workOrderFormSchema = z.object({
  quote_request_id: z.string().uuid().optional(),
  assigned_bay_id: z.string().uuid(),
  start_date: z.string(),
  start_time: z.string(),
  end_date: z.string(),
  end_time: z.string(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  notes: z.string().optional(),
  service_ids: z.array(z.string().uuid("Please select at least one service")).min(1, "Please select at least one service"),
})

export type WorkOrderFormValues = z.infer<typeof workOrderFormSchema>

export interface WorkOrderFormProps {
  selectedDate?: Date
  quoteRequest?: any // We'll type this properly later
  onSuccess?: () => void
  workOrder?: WorkOrder
}
