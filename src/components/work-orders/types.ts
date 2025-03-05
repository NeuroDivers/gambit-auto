
import { WorkOrder } from "@/types";

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
