
// Add this to the existing file or create it if it doesn't exist
export interface InvoiceFormValues {
  status?: string;
  notes?: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_address?: string;
  customer_street_address?: string;
  customer_unit_number?: string;
  customer_city?: string;
  customer_state_province?: string;
  customer_postal_code?: string;
  customer_country?: string;
  invoice_items: InvoiceItem[];
  subtotal?: number;
  tax_amount?: number;
  gst_rate?: number;
  qst_rate?: number;
  gst_amount?: number;
  qst_amount?: number;
  total?: number;
  due_date?: string;
  work_order_id?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  vehicle_vin?: string;
}

export interface InvoiceItem {
  id?: string;
  invoice_id?: string;
  service_id: string;
  service_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  commission_rate?: number;
  commission_type?: 'percentage' | 'flat' | 'flat_rate' | null;
  assigned_profile_id?: string | null;
  package_id?: string | null;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  created_at: string;
  updated_at?: string;
  status: string;
  customer_id?: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_address?: string;
  subtotal: number;
  tax_amount?: number;
  gst_amount?: number;
  qst_amount?: number;
  total: number;
  due_date?: string;
  payment_status?: string;
  notes?: string;
  is_finalized?: boolean;
  work_order_id?: string;
  business_profile_id?: string;
  company_name?: string;
  company_email?: string;
  company_phone?: string;
  company_address?: string;
  gst_number?: string;
  qst_number?: string;
  vehicle_id?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  vehicle_vin?: string;
  vehicle_body_class?: string;
  vehicle_doors?: number;
  vehicle_trim?: string;
}
