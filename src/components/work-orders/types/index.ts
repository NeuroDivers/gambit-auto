
export interface WorkOrder {
  id: string;
  created_at: string;
  updated_at?: string | null;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  contact_preference: 'phone' | 'email';
  vehicle_year: number; // Changed from string to number
  vehicle_make: string;
  vehicle_model: string;
  vehicle_trim?: string | null;
  vehicle_color?: string | null;
  vehicle_vin?: string | null;
  vehicle_body_class?: string | null;
  vehicle_doors?: number | null;
  vehicle_license_plate?: string | null;
  customer_address?: string | null;
  customer_street_address?: string | null;
  customer_unit_number?: string | null;
  customer_city?: string | null;
  customer_state_province?: string | null;
  customer_postal_code?: string | null;
  customer_country?: string | null;
  timeframe: string | 'flexible' | 'asap' | 'within_week' | 'within_month';
  preferred_date?: string | null;
  preferred_time?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  estimated_duration?: number | null;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled' | 'invoiced' | 'estimated';
  service_type?: string | null;
  additional_notes?: string | null;
  assigned_bay?: string | null;
  assigned_bay_id?: string | null;
  assigned_profile_id?: string | null;
  client_id?: string | null;
  service_bays?: {
    id: string;
    name: string;
  } | null;
}

export type WorkOrderStatus = WorkOrder['status'];

export interface WorkOrderFormValues {
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  contact_preference: 'phone' | 'email';
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_vin?: string;
  vehicle_color?: string;
  vehicle_body_class?: string;
  vehicle_doors?: number | null;
  vehicle_trim?: string;
  vehicle_license_plate?: string;
  additional_notes?: string;
  customer_address?: string;
  customer_street_address?: string;
  customer_unit_number?: string;
  customer_city?: string;
  customer_state_province?: string;
  customer_postal_code?: string;
  customer_country?: string;
  start_time: Date | null;
  estimated_duration: number | null;
  end_time: Date | null;
  assigned_bay_id: string | null;
  service_items: ServiceItemType[];
}

export interface WorkOrderFormProps {
  defaultValues?: Partial<WorkOrderFormValues>;
  workOrderId?: string;
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
}
