
export type WorkOrderStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'approved' | 'rejected' | 'invoiced' | 'estimated';

export type WorkOrder = {
  id: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address?: string;
  customer_vehicle_make: string;
  customer_vehicle_model: string;
  customer_vehicle_year: string | number;
  customer_vehicle_vin?: string;
  customer_vehicle_license_plate?: string;
  customer_vehicle_color?: string;
  customer_vehicle_body_class?: string;
  customer_vehicle_doors?: string | number;
  customer_vehicle_trim?: string;
  contact_preference: 'email' | 'phone' | 'text' | 'any';
  start_time: string | null;
  end_time: string | null;
  status: WorkOrderStatus;
  created_at: string;
  additional_notes?: string;
  estimated_duration?: number;
  assigned_bay_id?: string;
  assigned_profile_id?: string;
  client_id?: string;
  profiles: {
    id: string | null;
    first_name: string | null;
    last_name: string | null;
  };
  service_bay?: {
    id: string;
    name: string;
  } | null;
  work_order_services?: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    service_id: string;
    commission_rate?: number;
    commission_type?: string;
    assigned_profile_id?: string;
    profiles?: {
      id: string;
      first_name: string;
      last_name: string;
    };
    service_types?: {
      id: string;
      name: string;
      description?: string;
      base_price?: number;
    };
  }>;
  services?: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    service_id: string;
    service?: {
      id: string;
      name: string;
      description?: string;
    };
    commission_rate?: number;
    commission_type?: string;
  }>;
  // Add compatibility fields
  vehicle_year?: number | string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_vin?: string;
  vehicle_color?: string;
  vehicle_body_class?: string;
  vehicle_doors?: number | string;
  vehicle_trim?: string;
  vehicle_license_plate?: string;
};

export type ServiceItemType = {
  service_id: string;
  service_name?: string;
  quantity: number;
  unit_price: number;
  commission_rate?: number;
  commission_type?: string;
  assigned_profile_id?: string;
  is_main_service?: boolean; 
  sub_services?: ServiceItemType[];
  description?: string;
  package_id?: string;
  parent_id?: string;
};

export type WorkOrderFormValues = {
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  contact_preference: 'email' | 'phone' | 'text' | 'any';
  customer_vehicle_make: string;
  customer_vehicle_model: string;
  customer_vehicle_year: string;
  customer_vehicle_vin?: string;
  customer_vehicle_license_plate?: string;
  customer_vehicle_color?: string;
  customer_vehicle_body_class?: string;
  customer_vehicle_doors?: string;
  customer_vehicle_trim?: string;
  customer_address?: string;
  customer_street_address?: string;
  customer_unit_number?: string;
  customer_city?: string;
  customer_state_province?: string;
  customer_postal_code?: string;
  customer_country?: string;
  start_time: Date | null;
  end_time: Date | null;
  estimated_duration?: number;
  assigned_bay_id?: string;
  additional_notes?: string;
  client_id?: string;
  service_items?: ServiceItemType[];
  save_vehicle?: boolean;
  is_primary_vehicle?: boolean;
  
  // Adding compatibility fields to match hooks/useWorkOrderSubmission.ts
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: string | number;
  vehicle_vin?: string;
  vehicle_color?: string;
  vehicle_trim?: string;
  vehicle_body_class?: string;
  vehicle_doors?: string | number;
  vehicle_license_plate?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
};

export interface WorkOrderFormProps {
  workOrder?: WorkOrder;
  onSuccess?: () => void;
  defaultStartTime?: Date;
  onSubmitting?: (isSubmitting: boolean) => void;
}
