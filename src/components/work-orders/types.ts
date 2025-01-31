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
}).refine((data) => {
  const startDateTime = new Date(`${data.start_date}T${data.start_time}`)
  const endDateTime = new Date(`${data.end_date}T${data.end_time}`)
  return endDateTime > startDateTime
}, {
  message: "End date and time must be after start date and time",
  path: ["end_date"]
})

export type WorkOrderFormValues = z.infer<typeof workOrderFormSchema>

export interface ServiceBay {
  id: string
  name: string
  status: 'available' | 'unavailable' | 'maintenance' | 'in_use'
  created_at?: string
  updated_at?: string
}

export interface WorkOrder {
  id: string
  quote_request_id?: string
  assigned_bay_id?: string
  start_date: string
  end_date: string
  status: string
  notes?: string
  created_at?: string
  updated_at?: string
  service_bays?: Partial<ServiceBay>
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

export interface WorkOrderFormProps {
  selectedDate?: Date
  quoteRequest?: any // We'll type this properly later
  onSuccess?: () => void
  workOrder?: WorkOrder
}