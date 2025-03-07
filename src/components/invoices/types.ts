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
  customer_vehicle_make?: string;
  customer_vehicle_model?: string;
  customer_vehicle_year?: number;
  customer_vehicle_vin?: string;
  customer_vehicle_color?: string;
  customer_vehicle_trim?: string;
  customer_vehicle_body_class?: string;
  customer_vehicle_doors?: number;
  customer_vehicle_license_plate?: string;
  services?: InvoiceItem[]; // Adding this field for compatibility
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
  customer_vehicle_make?: string;
  customer_vehicle_model?: string;
  customer_vehicle_year?: number;
  customer_vehicle_vin?: string;
  customer_vehicle_color?: string;
  customer_vehicle_body_class?: string;
  customer_vehicle_doors?: number;
  customer_vehicle_trim?: string;
  customer_vehicle_license_plate?: string;
  stripe_customer_id?: string;
  invoice_items?: InvoiceItem[];
  vehicle_color?: string;
}

export interface CustomerInfo {
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address?: string;
}

// Simple PrintRef type to replace UseReactToPrintFn
export interface PrintRef {
  handlePrint: () => void;
  printRef: React.RefObject<HTMLElement>;
}
