
import { WorkOrder } from "@/types";

export type { WorkOrder };

export type CustomerType = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  address?: string;
  street_address?: string;
  unit_number?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
};

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
  client_id?: string;
  start_time: Date | null;
  end_time: Date | null;
  estimated_duration: number | null;
  assigned_bay_id: string | null;
  service_items: any[];
  // Address fields
  street_address?: string;
  unit_number?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
  timeframe?: "flexible" | "asap" | "within_week" | "within_month";
  save_vehicle?: boolean;
  vehicle_id?: string;
  // Vehicle additional fields
  vehicle_trim?: string;
  vehicle_body_class?: string;
  vehicle_doors?: number;
}

export interface WorkOrderFormProps {
  workOrder?: WorkOrder;
  onSuccess?: () => void;
  defaultStartTime?: Date;
  onSubmitting?: (isSubmitting: boolean) => void;
}

export interface VehicleInfoFieldsProps {
  customerId?: string;
  vehicleInfo?: any;
  onChange?: (vehicleInfo: any) => void;
  data?: any;
}

export interface SchedulingFieldsProps {
  value?: any;
  onChange?: (scheduleInfo: any) => void;
}

export interface BayAssignmentFieldProps {
  value?: string;
  onChange?: (bayId: string) => void;
}

export interface CustomerInfoFieldsProps {
  customerId?: string;
  onSelectCustomer?: (customer: CustomerType) => void;
}

export interface AdditionalNotesFieldProps {
  value: string;
  onChange: (notes: string) => void;
}

export interface WorkOrderFormHeaderProps {
  date?: any;
  customerName?: string;
}

export interface FormSectionsProps {
  onSubmit: () => void;
  customer: any;
  onCustomerChange: (customer: any) => void;
  vehicleInfo: any;
  onVehicleInfoChange: (vehicleInfo: any) => void;
  scheduleInfo: any;
  onScheduleInfoChange: (scheduleInfo: any) => void;
  bayId: string | null;
  onBayIdChange: (bayId: string) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  services: any[];
  onServicesChange: (services: any[]) => void;
  isCreating: boolean;
  isSubmitting: boolean;
}
