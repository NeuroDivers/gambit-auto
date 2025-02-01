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
  customer_name: string
  customer_email: string
  customer_address: string
  vehicle_make: string
  vehicle_model: string
  vehicle_year: number
  vehicle_vin: string
}