
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
  address?: string | null
  street_address?: string
  unit_number?: string
  city?: string
  state_province?: string
  postal_code?: string
  country?: string
  timeframe: "flexible" | "asap" | "within_week" | "within_month"
  start_time?: string | null
  estimated_duration?: number | null
  end_time?: string | null
  assigned_bay_id?: string | null
  assigned_profile_id?: string | null
  client_id?: string
  vehicle_id?: string | null
  service_items?: any[]
  service_bays?: {
    id: string
    name: string
  }
}
