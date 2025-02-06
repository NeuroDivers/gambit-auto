export type InvoiceItem = {
  service_name: string
  description: string
  quantity: number
  unit_price: number
}

export type InvoiceFormValues = {
  notes: string
  status: string
  invoice_items: InvoiceItem[]
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  customer_phone: string
  customer_address: string
  vehicle_make: string
  vehicle_model: string
  vehicle_year: number
  vehicle_vin: string
  subtotal?: number
  tax_amount?: number
  total?: number
}

export type Invoice = {
  id: string
  invoice_number: string
  created_at: string
  status: string
  notes: string | null
  subtotal: number
  tax_amount: number
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
  invoice_items: InvoiceItem[]
}