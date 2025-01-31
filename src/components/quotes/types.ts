export type QuoteRequest = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  contact_preference: "phone" | "email"
  vehicle_make: string
  vehicle_model: string
  vehicle_year: number
  vehicle_serial: string
  additional_notes?: string
  media_url?: string | null
  status: string
  created_at: string
  price?: number | null
  quote_request_services: {
    service_types: {
      name: string
    }
  }[]
}