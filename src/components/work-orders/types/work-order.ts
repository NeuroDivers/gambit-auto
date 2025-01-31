import { ServiceBay } from "./service-bay"

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