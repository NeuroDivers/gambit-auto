export type Customer = {
  id: string
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  customer_phone_number?: string | null
  customer_unit_number?: string | null
  customer_street_address?: string | null
  customer_city?: string | null
  customer_state_province?: string | null
  customer_postal_code?: string | null
  customer_country?: string | null
  address?: string | null
  created_at: string
  updated_at: string
  user_id?: string | null
  access_token?: string | null
  profile_id?: string | null
  profile?: {
    id: string
    first_name: string | null
    last_name: string | null
    email: string | null
    phone_number: string | null
  } | null
  notes?: string | null
  total_spent?: number
  total_invoices?: number
  total_work_orders?: number
  last_sign_in_at?: string | null
  last_invoice_date?: number | null
  last_work_order_date?: number | null
  monthlySpending?: Array<{
    month: string
    amount: number
  }>
  invoices?: Array<{
    id: string
    invoice_number: string
    total: number
    status: string
    created_at: string
    vehicle_id?: string
  }>
  quotes?: Array<{
    id: string
    quote_number?: string
    estimate_number?: string
    total: number
    status: string
    created_at: string
    vehicle_id?: string
  }>
}

export type CustomerFormValues = {
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  customer_phone_number?: string
  address?: string
  customer_street_address?: string
  customer_unit_number?: string
  customer_city?: string
  customer_state_province?: string
  customer_postal_code?: string
  customer_country?: string
}

// Vehicle type
export type Vehicle = {
  id: string
  customer_id: string
  make: string
  model: string
  year: number
  vin?: string | null
  color?: string | null
  license_plate?: string | null
  notes?: string | null
  is_primary?: boolean
  body_class?: string | null
  doors?: number | null
  trim?: string | null
  created_at: string
  updated_at: string
}
