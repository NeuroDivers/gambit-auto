
import { WorkOrder as BaseWorkOrder, WorkOrderFormValues as BaseWorkOrderFormValues, WorkOrderFormProps as BaseWorkOrderFormProps, CustomerType as BaseCustomerType } from "@/types/work-order";

// Use the base WorkOrder type
export type WorkOrder = BaseWorkOrder;

// Use the base WorkOrderFormValues type with client_id
export interface WorkOrderFormValues extends BaseWorkOrderFormValues {
  client_id?: string; // Add this for compatibility
  start_time?: Date | string | null;
  end_time?: Date | string | null;
  service_items?: any[];
  first_name: string;
  last_name: string;
  email: string; 
  phone_number: string;
  contact_preference: "phone" | "email";
  vehicle_serial: string;
  additional_notes?: string;
  street_address?: string;
  unit_number?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
  estimated_duration?: number | null;
  assigned_bay_id?: string | null;
}

// Use the base WorkOrderFormProps type
export type WorkOrderFormProps = BaseWorkOrderFormProps;

// Use the base CustomerType
export type CustomerType = BaseCustomerType;

// Define the WorkOrderStatusSelectProps interface for the status select component
export interface WorkOrderStatusSelectProps {
  status: string;
  quoteId: string;
}
