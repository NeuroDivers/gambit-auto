
export type QuoteRequestStatus = "pending" | "estimated" | "accepted" | "rejected" | "converted";

export type QuoteItem = {
  id: string
  quote_request_id: string
  service_id: string
  service_name: string
  quantity: number
  unit_price: number
  details: Record<string, any> | null
}

export type QuoteRequest = {
  id: string
  client_id: string
  status: QuoteRequestStatus
  vehicle_make: string | null
  vehicle_model: string | null
  vehicle_year: number | null
  vehicle_vin: string | null
  description: string | null
  timeframe: string | null
  contact_preference: string | null
  additional_notes: string | null
  estimated_amount: number | null
  client_response: string | null
  created_at: string
  media_urls: string[] | null
  quote_items?: QuoteItem[]
}
