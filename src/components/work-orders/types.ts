
export type ServiceType = {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export type ServiceItemType = {
  service_id: string;
  service_name: string;
  quantity: number;
  unit_price: number;
  main_service_id?: string | null;
  package_id?: string | null;
  package_name?: string | null;
  addons?: Array<{
    id: string;
    name: string;
    price: number;
    selected: boolean;
  }>;
}

import { WorkOrder as BaseWorkOrder } from "@/types"

export type WorkOrder = BaseWorkOrder & {
  assigned_profile_id?: string | null
}

export type WorkOrderFormProps = {
  workOrder?: WorkOrder
  onSuccess?: () => void
  defaultStartTime?: Date
  onSubmitting?: (isSubmitting: boolean) => void
}

export type ServiceListProps = {
  workOrderServices: ServiceItemType[]
  onServicesChange: (services: ServiceItemType[]) => void
  disabled?: boolean
}

export type WorkOrderFormValues = {
  first_name: string
  last_name: string
  email: string
  phone_number: string
  contact_preference: "phone" | "email"
  vehicle_make: string
  vehicle_model: string
  vehicle_year: number
  vehicle_serial: string
  additional_notes?: string
  address?: string
  service_items: Array<ServiceItemType>
  price: number
  start_time?: Date | null
  estimated_duration?: number | null
  end_time?: Date | null
  assigned_bay_id?: string | null
  assigned_profile_id?: string | null
}
