import { z } from "zod"

export const workOrderFormSchema = z.object({
  quote_request_id: z.string().uuid().optional(),
  assigned_bay_id: z.string().uuid(),
  start_date: z.string(),
  end_date: z.string(),
  notes: z.string().optional(),
})

export type WorkOrderFormValues = z.infer<typeof workOrderFormSchema>