
export type QuoteRequestStatus = "pending" | "estimated" | "accepted" | "rejected" | "converted";

export type QuoteRequest = {
  id: string
  client_id: string
  status: QuoteRequestStatus
  vehicle_make: string | null
  vehicle_model: string | null
  vehicle_year: number | null
  vehicle_vin: string | null
  description: string | null
  service_ids: string[]
  service_details: Record<string, any> | null
  service_estimates: Record<string, number> | null
  estimated_amount: number | null
  client_response: string | null
  created_at: string
  media_urls: string[] | null
}

