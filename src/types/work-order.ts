
export interface WorkOrder {
  id: string;
  // Customer information
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  contact_preference: "phone" | "email";
  client_id?: string;
  customer_id?: string; // Alias for client_id for backward compatibility
  
  // Vehicle information
  vehicle_id?: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_serial: string;
  vehicle_body_class?: string;
  vehicle_doors?: number;
  vehicle_trim?: string;
  vehicle_color?: string;
  
  // Address information
  street_address?: string;
  unit_number?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
  address?: string;
  
  // Scheduling
  timeframe?: "flexible" | "asap" | "within_week" | "within_month";
  start_time?: string | null;
  end_time?: string | null;
  estimated_duration?: number | null;
  service_date?: string;
  service_time?: string;
  
  // Status and metadata
  status: string;
  created_at: string;
  updated_at?: string;
  price?: number | null;
  additional_notes?: string;
  media_url?: string | null;
  
  // Assignment information
  assigned_bay_id?: string | null;
  assigned_profile_id?: string | null;
  assigned_to?: string;
  
  // Related data
  service_items?: any[];
  services?: any[];
  service_bays?: {
    id: string;
    name: string;
  };
  bay_id?: string;
  bay_name?: string;
}

export interface WorkOrderFormProps {
  workOrder?: WorkOrder;
  onSuccess?: () => void;
  defaultStartTime?: Date;
  onSubmitting?: (isSubmitting: boolean) => void;
}

export interface WorkOrderFormValues {
  // Customer information fields
  customer_id?: string;
  client_id?: string; // Alias for customer_id
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  contact_preference: "phone" | "email";
  
  // Legacy fields for backward compatibility
  customer_first_name?: string;
  customer_last_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  customer_city?: string;
  customer_state?: string;
  customer_zip?: string;
  
  // Vehicle information
  vehicle_id?: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: string | number;
  vehicle_color?: string;
  vehicle_vin?: string;
  vehicle_serial: string;
  vehicle_license_plate?: string;
  
  // Address information
  street_address?: string;
  unit_number?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
  
  // Scheduling
  service_date?: string;
  service_time?: string;
  start_time?: Date | string | null;
  end_time?: Date | string | null;
  estimated_duration?: number | null;
  
  // Assignment and metadata
  status: string;
  bay_id?: string;
  assigned_bay_id?: string | null;
  notes?: string;
  additional_notes?: string;
  
  // Services
  services?: any[];
  service_items?: any[];
}

export interface CustomerType {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  created_at?: string;
  vehicles?: any[];
}

export interface CustomerSearchProps {
  onSelectCustomer?: (customer: CustomerType) => void;
  onSelectVehicle?: (vehicle: any) => void;
}
