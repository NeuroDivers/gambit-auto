
import { CustomerVehicleInfo, CustomerVehicleRecordInfo } from "@/types/shared-types";

export type InvoiceItem = {
  service_id: string
  package_id?: string | null
  service_name: string
  description: string
  quantity: number
  unit_price: number
  commission_rate?: number | null
  commission_type?: 'percentage' | 'flat' | null
  assigned_profile_id?: string | null
}

export type InvoiceFormValues = CustomerVehicleInfo & {
  notes: string
  status: string
  due_date: string | null
  invoice_items: InvoiceItem[]
  subtotal: number
  gst_amount: number
  qst_amount: number
  total: number
}

export type Invoice = CustomerVehicleRecordInfo & {
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
  invoice_items: InvoiceItem[]
  payment_status?: string
  stripe_customer_id?: string | null
  work_order_id?: string | null
  vehicle_id?: string | null
}
