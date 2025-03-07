
export interface WorkOrder {
  id: string;
  created_at: string;
  updated_at: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address?: string;
  customer_street_address?: string;
  customer_unit_number?: string;
  customer_city?: string;
  customer_state_province?: string;
  customer_postal_code?: string;
  customer_country?: string;
  customer_vehicle_make: string;
  customer_vehicle_model: string;
  customer_vehicle_year: number;
  customer_vehicle_vin?: string;
  customer_vehicle_color?: string;
  customer_vehicle_body_class?: string;
  customer_vehicle_doors?: number;
  customer_vehicle_trim?: string;
  customer_vehicle_license_plate?: string;
  contact_preference: "phone" | "email";
  additional_notes?: string;
  status: string;
  estimated_duration?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  assigned_bay_id?: string | null;
  assigned_profile_id?: string | null;
  client_id?: string | null;
  service_bays?: {
    id: string;
    name: string;
  };
  work_order_services?: WorkOrderService[];
}

export interface WorkOrderService {
  id: string;
  service_id: string;
  quantity: number;
  unit_price: number;
  service_types?: {
    id: string;
    name: string;
    description?: string;
    price?: number;
  };
  commission_rate?: number;
  commission_type?: string;
  assigned_profile_id?: string;
  main_service_id?: string;
  sub_service_id?: string;
}

export interface WorkOrderFormValues {
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  contact_preference: "phone" | "email";
  customer_vehicle_make: string;
  customer_vehicle_model: string;
  customer_vehicle_year: number;
  customer_vehicle_vin?: string;
  customer_vehicle_color?: string;
  customer_vehicle_body_class?: string;
  customer_vehicle_doors?: number | null;
  customer_vehicle_trim?: string;
  customer_vehicle_license_plate?: string;
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
  save_vehicle?: boolean;
  is_primary_vehicle?: boolean;
  client_id?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  vehicle_vin?: string;
  vehicle_color?: string;
  vehicle_body_class?: string;
  vehicle_doors?: number | null;
  vehicle_trim?: string;
  vehicle_license_plate?: string;
}

export interface ServiceItemType {
  service_id: string;
  service_name: string;
  quantity: number;
  unit_price: number;
  commission_rate: number;
  commission_type: 'percentage' | 'flat' | 'flat_rate' | null;
  assigned_profile_id?: string | null;
  description?: string;
  package_id?: string | null;
  sub_services?: ServiceItemType[];
  parent_id?: string;
  main_service_id?: string;
  sub_service_id?: string;
  is_parent?: boolean;
}

export interface WorkOrderFormProps {
  workOrder?: WorkOrder;
  onSuccess?: () => void;
  defaultStartTime?: Date;
  onSubmitting?: (isSubmitting: boolean) => void;
}
