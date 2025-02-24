
export interface WorkOrder {
  id: string;
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
  status: string;
  created_at: string;
  updated_at: string;
  start_time?: string;
  end_time?: string;
  estimated_duration?: string;
  assigned_bay_id?: string | null;
  assigned_profile_id?: string | null;
  service_bays?: {
    name: string;
  };
  assigned_to?: {
    first_name: string;
    last_name: string;
  };
  address: string;
  timeframe: "flexible" | "asap" | "within_week" | "within_month";
}

export interface ServiceItemType {
  service_id: string;
  service_name: string;
  quantity: number;
  unit_price: number;
  commission_rate?: number | null;
  commission_type?: 'percentage' | 'flat' | null;
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
  address: string;
  start_time: Date | null;
  estimated_duration: number | null;
  end_time: Date | null;
  assigned_bay_id: string | null;
  assigned_profile_id: string | null;
  service_items: ServiceItemType[];
}

export interface WorkOrderFormProps {
  workOrder?: WorkOrder;
  onSuccess?: () => void;
  defaultStartTime?: Date;
  onSubmitting?: (isSubmitting: boolean) => void;
}
