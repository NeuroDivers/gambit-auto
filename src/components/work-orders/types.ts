
export type WorkOrder = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  contact_preference: "phone" | "email"
  vehicle_make: string
  vehicle_model: string
  vehicle_year: number
  vehicle_serial: string
  additional_notes?: string
  media_url?: string | null
  status: string
  created_at: string
  price?: number | null
  address: string | null
  timeframe: "flexible" | "asap" | "within_week" | "within_month"
  start_time?: string | null
  estimated_duration?: string | null
  end_time?: string | null
  assigned_bay_id?: string | null
  assigned_profile_id?: string | null
}

export interface ServiceItemType {
  service_id: string;
  service_name: string;
  quantity: number;
  unit_price: number;
  id?: string;
}

export interface WorkOrderFormValues {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  contact_preference: "phone" | "email";
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_serial: string;
  additional_notes?: string;
  address?: string;
  start_time?: Date | null;
  estimated_duration?: number | null;
  end_time?: Date | null;
  assigned_bay_id?: string | null;
  assigned_profile_id?: string | null;
  service_items: ServiceItemType[];
}

export interface WorkOrderFormProps {
  workOrder?: WorkOrder;
  onSuccess?: () => void;
}
