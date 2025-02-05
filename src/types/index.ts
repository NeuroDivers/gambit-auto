export type WorkOrder = {
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
  address: string | null
  timeframe: "flexible" | "asap" | "within_week" | "within_month"
  start_time?: string | null
  estimated_duration?: string | null
  end_time?: string | null
}