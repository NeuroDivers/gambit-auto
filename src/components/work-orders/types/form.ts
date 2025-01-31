import { z } from "zod"

export const workOrderFormSchema = z.object({
  quote_request_id: z.string().uuid().optional(),
  assigned_bay_id: z.string().uuid(),
  assigned_sidekick_id: z.string().uuid().optional(),
  start_date: z.string(),
  end_date: z.string(),
  notes: z.string().optional(),
})

export type WorkOrderFormValues = z.infer<typeof workOrderFormSchema>

export interface WorkOrderFormProps {
  selectedDate?: Date
  quoteRequest?: any // We'll type this properly later
  onSuccess?: () => void
  workOrder?: WorkOrder
}