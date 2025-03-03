
export type EstimateItem = {
  id?: string
  estimate_id?: string
  service_id: string
  service_name: string
  description: string
  quantity: number
  unit_price: number
  commission_rate?: number | null
  commission_type?: 'percentage' | 'flat' | null
}

export type EstimateFormValues = {
  notes: string
  status: string
  due_date?: string | null
  estimate_items: EstimateItem[]
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  customer_phone: string
  customer_address: string
  vehicle_make: string
  vehicle_model: string
  vehicle_year: number
  vehicle_vin: string
  subtotal: number
  gst_amount: number
  qst_amount: number
  total: number
}

export type Estimate = {
  id: string
  estimate_number: string
  created_at: string
  status: string
  notes: string | null
  subtotal: number
  gst_amount: number
  qst_amount: number
  total: number
  due_date: string | null
  company_name: string | null
  company_phone: string | null
  company_email: string | null
  company_address: string | null
  gst_number: string | null
  qst_number: string | null
  customer_first_name: string | null
  customer_last_name: string | null
  customer_email: string | null
  customer_address: string | null
  customer_phone: string | null
  vehicle_make: string | null
  vehicle_model: string | null
  vehicle_year: number | null
  vehicle_vin: string | null
  estimate_items: EstimateItem[]
}

export type EstimateRequest = {
  id: string
  customer_id?: string | null
  status: string
  service_type?: string | null
  description?: string | null
  vehicle_make?: string | null
  vehicle_model?: string | null
  vehicle_year?: number | null
  vehicle_vin?: string | null
  created_at: string
  updated_at: string
  name?: string | null
  email?: string | null
  phone?: string | null
}
