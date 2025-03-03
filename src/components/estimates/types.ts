
export type EstimateItem = {
  service_id: string
  service_name: string
  description: string
  quantity: number
  unit_price: number
}

export type EstimateFormValues = {
  notes: string
  status: string
  service_items: EstimateItem[]
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  customer_phone: string
  customer_address: string
  vehicle_make: string
  vehicle_model: string
  vehicle_year: number
  vehicle_vin: string
  vehicle_body_class?: string
  vehicle_doors?: number
  vehicle_trim?: string
}

export type Estimate = {
  id: string
  estimate_number: string
  created_at: string
  status: string
  notes: string | null
  subtotal: number
  tax_amount: number
  total: number
  customer_first_name: string | null
  customer_last_name: string | null
  customer_email: string | null
  customer_address: string | null
  customer_phone: string | null
  vehicle_make: string | null
  vehicle_model: string | null
  vehicle_year: number | null
  vehicle_vin: string | null
  vehicle_body_class?: string | null
  vehicle_doors?: number | null
  vehicle_trim?: string | null
  estimate_items: EstimateItem[]
}

// Maintain backward compatibility
export type Quote = Estimate
export type QuoteFormValues = EstimateFormValues
