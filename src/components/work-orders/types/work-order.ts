export type WorkOrder = {
  id: string
  quote_request_id: string | null
  assigned_bay_id: string | null
  start_date: string
  end_date: string
  status: string
  notes: string | null
  quote_request?: {
    status: string
  }
}