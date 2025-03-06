
import { UseFormReturn } from "react-hook-form";

export type WorkOrder = {
  id: string;
  created_at: string;
  updated_at?: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_vin?: string;
  status: "pending" | "approved" | "rejected" | "in_progress" | "completed" | "cancelled";
  assigned_bay_id?: string | null;
  assigned_profile_id?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  additional_notes?: string;
  service_bays?: {
    id: string;
    name: string;
  } | null;
  work_order_services?: WorkOrderService[];
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
  commission_type?: 'percentage' | 'flat_rate' | null;
};

export interface WorkOrderFormProps {
  workOrder?: WorkOrder;
  onSuccess?: () => void;
  defaultStartTime?: string;
  onSubmitting?: (isSubmitting: boolean) => void;
}

export interface WorkOrderFormValues {
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address?: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_vin: string;
  start_time?: string | null;
  end_time?: string | null;
  status: "pending" | "approved" | "rejected" | "in_progress" | "completed" | "cancelled";
  assigned_bay_id?: string | null;
  additional_notes?: string;
  services: Array<{
    service_id: string;
    quantity: number;
    unit_price: number;
    assigned_profile_id?: string | null;
    commission_rate?: number | null;
    commission_type?: 'percentage' | 'flat_rate' | null;
  }>;
  client_id?: string | null;
}

export interface FormSectionsProps {
  form: UseFormReturn<WorkOrderFormValues>;
  isEditing: boolean;
  isSubmitting: boolean;
  customerId: string | null;
}
