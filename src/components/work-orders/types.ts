
// Define the WorkOrder type for export
export interface WorkOrder {
  id: string;
  customer_id: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  vehicle_id?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: string;
  vehicle_color?: string;
  vehicle_vin?: string;
  service_date: string;
  status: string;
  bay_id?: string;
  bay_name?: string;
  notes?: string;
  services?: any[];
  created_at?: string;
  updated_at?: string;
  assigned_to?: string;
  total_amount?: number;
}

// Define the WorkOrderFormValues type for export
export interface WorkOrderFormValues {
  customer_id: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  customer_state: string;
  customer_zip: string;
  vehicle_id: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: string;
  vehicle_color: string;
  vehicle_vin: string;
  vehicle_license_plate: string;
  service_date: string;
  service_time: string;
  status: string;
  bay_id: string;
  notes: string;
  services: any[];
}
