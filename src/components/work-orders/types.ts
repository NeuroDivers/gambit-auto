
// Update the 'profiles' and add 'work_order_services' to WorkOrder interface
import { CustomerVehicleInfo, CustomerVehicleRecordInfo } from "@/types/shared-types";

export interface WorkOrder extends CustomerVehicleRecordInfo {
  id: string;
  created_at: string;
  updated_at?: string | null;
  contact_preference: 'phone' | 'email';
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
  assigned_bay_id?: string | null;
  assigned_profile_id?: string | null;
  client_id?: string | null;
  estimated_duration?: string | number | null;
  is_archived?: boolean;
  media_url?: string | null;
  profiles?: {
    id?: string;
    first_name: string | null;
    last_name: string | null;
  };
  // Adding work_order_services relationship
  work_order_services?: Array<{
    id: string;
    service_id: string;
    quantity: number;
    unit_price: number;
    commission_rate: number;
    commission_type: 'percentage' | 'flat';
    assigned_profile_id?: string | null;
    service_types?: {
      id: string;
      name: string;
      description: string;
      base_price: number;
    }
  }>;
  // Vehicle fields
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  vehicle_vin?: string;
  vehicle_color?: string;
  vehicle_trim?: string;
  vehicle_body_class?: string;
  vehicle_doors?: number;
  customer_vehicle_color?: string;
}

export type WorkOrderStatus = WorkOrder['status'];

export interface WorkOrderFormValues extends CustomerVehicleInfo {
  contact_preference: 'phone' | 'email';
  additional_notes?: string;
  start_time: Date | null;
  estimated_duration: number | null;
  end_time: Date | null;
  assigned_bay_id: string | null;
  service_items: Array<ServiceItemType>;
  save_vehicle?: boolean;
  is_primary_vehicle?: boolean;
  client_id?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  vehicle_vin?: string;
  vehicle_color?: string;
  vehicle_trim?: string;
  vehicle_body_class?: string;
  vehicle_doors?: number;
  vehicle_license_plate?: string;
}

export interface ServiceItemType {
  service_id: string;
  service_name: string;
  quantity: number;
  unit_price: number;
  commission_rate: number;
  commission_type: 'percentage' | 'flat' | null;  // Standardized to remove 'flat_rate'
  assigned_profile_id?: string | null;
  description?: string;
  sub_services?: ServiceItemType[];
  is_parent?: boolean;
  parent_id?: string;
  package_id?: string | null;
}

export interface WorkOrderFormProps {
  workOrder?: WorkOrder;
  onSuccess?: () => void;
  defaultStartTime?: Date;
  onSubmitting?: (isSubmitting: boolean) => void;
}
