
export type InvoiceItem = {
  service_id: string
  package_id?: string | null
  service_name: string
  description: string
  quantity: number
  unit_price: number
  commission_rate?: number | null
  commission_type?: 'percentage' | 'flat' | null  // Standardized to 'flat' throughout
  assigned_profile_id?: string | null
}

export type InvoiceFormValues = {
  notes: string
  status: string
  due_date: string | null
  invoice_items: InvoiceItem[]
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  customer_phone: string
  customer_address: string
  customer_street_address?: string
  customer_unit_number?: string
  customer_city?: string
  customer_state_province?: string
  customer_postal_code?: string
  customer_country?: string
  vehicle_make: string
  vehicle_model: string
  vehicle_year: number
  vehicle_vin: string
  subtotal: number
  gst_amount: number
  qst_amount: number
  total: number
}

export type Invoice = {
  id: string
  invoice_number: string
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
  customer_street_address?: string | null
  customer_unit_number?: string | null
  customer_city?: string | null
  customer_state_province?: string | null
  customer_postal_code?: string | null
  customer_country?: string | null
  vehicle_make: string | null
  vehicle_model: string | null
  vehicle_year: number | null
  vehicle_vin: string | null
  vehicle_body_class?: string | null
  vehicle_doors?: number | null
  vehicle_trim?: string | null
  invoice_items: InvoiceItem[]
  payment_status?: string
  stripe_customer_id?: string | null
}
