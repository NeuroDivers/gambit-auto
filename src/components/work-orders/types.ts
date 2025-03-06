
import { UseFormReturn } from "react-hook-form";

export type WorkOrder = {
  id: string;
  created_at: string;
  updated_at?: string;
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
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_vin?: string; // Made optional to match actual usage
  vehicle_color?: string;
  vehicle_trim?: string;
  vehicle_body_class?: string;
  vehicle_doors?: number | null;
  vehicle_license_plate?: string;
  contact_preference?: "phone" | "email";
  status: "pending" | "approved" | "rejected" | "in_progress" | "completed" | "cancelled" | "invoiced" | "estimated";
  assigned_bay_id?: string | null;
  assigned_profile_id?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  estimated_duration?: number | null;
  additional_notes?: string;
  service_bays?: {
    id: string;
    name: string;
  } | null;
  work_order_services?: WorkOrderService[];
  timeframe?: string | "flexible" | "asap" | "within_week" | "within_month"; // Updated to handle string or specific values
  client_id?: string | null;
};

export type WorkOrderService = {
  id: string;
  work_order_id: string;
  service_id: string;
  quantity: number;
  unit_price: number;
  service_types?: {
    id: string;
    name: string;
    description?: string;
  };
  profiles?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  assigned_profile_id?: string | null;
  commission_rate?: number | null;
  commission_type?: 'percentage' | 'flat' | null;
  main_service_id?: string | null;
  sub_service_id?: string | null;
};

export interface ServiceItemType {
  service_id: string;
  service_name: string;
  quantity: number;
  unit_price: number;
  description?: string;
  assigned_profile_id?: string | null;
  commission_rate: number;
  commission_type: 'percentage' | 'flat' | null;
  sub_services?: ServiceItemType[];
  parent_id?: string;
}

export interface WorkOrderFormProps {
  workOrder?: WorkOrder;
  onSuccess?: () => void;
  defaultStartTime?: Date;
  onSubmitting?: (isSubmitting: boolean) => void;
}

export interface WorkOrderFormValues {
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  contact_preference?: "phone" | "email";
  customer_address?: string;
  customer_street_address?: string;
  customer_unit_number?: string;
  customer_city?: string;
  customer_state_province?: string;
  customer_postal_code?: string;
  customer_country?: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_vin: string;
  vehicle_color?: string;
  vehicle_trim?: string;
  vehicle_body_class?: string;
  vehicle_doors?: number | null;
  vehicle_license_plate?: string;
  start_time?: Date | null;
  end_time?: Date | null;
  estimated_duration?: number | null;
  status: "pending" | "approved" | "rejected" | "in_progress" | "completed" | "cancelled" | "invoiced" | "estimated";
  assigned_bay_id?: string | null;
  additional_notes?: string;
  service_items: ServiceItemType[];
  client_id?: string | null;
  save_vehicle?: boolean;
  is_primary_vehicle?: boolean;
}

export interface FormSectionsProps {
  form: UseFormReturn<WorkOrderFormValues>;
  isEditing: boolean;
  isSubmitting: boolean;
  customerId: string | null;
}
