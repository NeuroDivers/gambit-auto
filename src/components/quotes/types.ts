
export type QuoteItem = {
  service_id: string
  service_name: string
  description: string
  quantity: number
  unit_price: number
}

export type QuoteFormValues = {
  notes: string
  status: string
  service_items: QuoteItem[]
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  customer_phone: string
  customer_address: string
  vehicle_make: string
  vehicle_model: string
  vehicle_year: number
  vehicle_vin: string
}

export type Quote = {
  id: string
  quote_number: string
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
  quote_items: QuoteItem[]
}
