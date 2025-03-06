
export type WorkOrder = {
  id: string
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  customer_phone: string
  contact_preference: "phone" | "email"
  vehicle_make: string
  vehicle_model: string
  vehicle_year: number
  vehicle_vin: string
  additional_notes?: string
  media_url?: string | null
  status: "pending" | "in_progress" | "completed" | "cancelled" | "approved" | "rejected"
  created_at: string
  price?: number | null
  customer_address?: string | null
  customer_street_address?: string
  customer_unit_number?: string
  customer_city?: string
  customer_state_province?: string
  customer_postal_code?: string
  customer_country?: string
  timeframe: "flexible" | "asap" | "within_week" | "within_month"
  start_time?: string | null
  estimated_duration?: string | null
  end_time?: string | null
  assigned_bay_id?: string | null
  assigned_profile_id?: string | null
  client_id?: string
  service_bays?: {
    id: string
    name: string
  }
}
