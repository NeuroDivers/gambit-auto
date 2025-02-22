
export type Client = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number?: string | null
  address?: string | null
  created_at: string
  updated_at: string
  user_id?: string | null
  access_token?: string | null
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
  }>
  quotes?: Array<{
    id: string
    quote_number: string
    total: number
    status: string
    created_at: string
  }>
}

export type ClientFormValues = {
  first_name: string
  last_name: string
  email: string
  phone_number?: string
  address?: string
}
