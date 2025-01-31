import { z } from "zod"

export const workOrderFormSchema = z.object({
  quote_request_id: z.string().uuid().optional(),
  assigned_bay_id: z.string().uuid(),
  start_date: z.string(),
  end_date: z.string(),
  notes: z.string().optional(),
})

export type WorkOrderFormValues = z.infer<typeof workOrderFormSchema>

export interface ServiceBay {
  id: string
  name: string
  status: 'available' | 'unavailable' | 'maintenance'
}

export interface WorkOrder {
  id: string
  quote_request_id?: string
  assigned_bay_id?: string
  start_date: string
  end_date: string
  status: string
  notes?: string
  service_bays?: ServiceBay
  quote_requests?: {
    first_name?: string
    last_name?: string
    quote_request_services?: Array<{
      service_types: {
        name: string
      }
    }>
  }
}