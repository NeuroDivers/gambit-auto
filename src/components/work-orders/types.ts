
export interface WorkOrder {
  id: string;
  created_at: string;
  updated_at?: string | null;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  contact_preference: 'phone' | 'email';
  customer_vehicle_year: string;
  customer_vehicle_make: string;
  customer_vehicle_model: string;
  customer_vehicle_trim?: string | null;
  customer_vehicle_color?: string | null;
  customer_vehicle_vin?: string | null;
  service_bays?: {
    id: string;
    name: string;
  } | null;
  timeframe: string | 'flexible' | 'asap' | 'within_week' | 'within_month';
  preferred_date?: string | null;
  preferred_time?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled' | 'invoiced' | 'estimated';
  service_type?: string | null;
  additional_notes?: string | null;
  assigned_bay?: string | null;
  assigned_profile_id?: string | null;
  client_id?: string | null;
}

export type WorkOrderStatus = WorkOrder['status'];
