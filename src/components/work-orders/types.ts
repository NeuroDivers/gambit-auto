
import { ServiceItemType } from "@/types/service-item"
import { WorkOrder as BaseWorkOrder } from "@/types"

export interface WorkOrderFormValues {
  first_name: string
  last_name: string
  email: string
  phone_number: string
  contact_preference: "phone" | "email"
  vehicle_make: string
  vehicle_model: string
  vehicle_year: number
  vehicle_serial: string
  vehicle_body_class?: string
  vehicle_doors?: number | null
  vehicle_trim?: string
  additional_notes?: string
  media_url?: string | null
  address?: string
  street_address?: string
  unit_number?: string
  city?: string
  state_province?: string
  postal_code?: string
  country?: string
  client_id?: string
  start_time: Date | null
  estimated_duration: number | null
  end_time: Date | null
  assigned_bay_id: string | null
  service_items: ServiceItemType[]
  is_primary_vehicle?: boolean
  save_vehicle?: boolean
}

export interface WorkOrderFormProps {
  workOrder?: WorkOrder
  onSuccess?: () => void
  defaultStartTime?: Date
  onSubmitting?: (isSubmitting: boolean) => void
}

// Export the WorkOrder type
export type WorkOrder = BaseWorkOrder;

// Customer type definition for FormSections
export interface CustomerType {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  // Add other customer fields as needed
}
