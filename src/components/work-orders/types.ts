
import { ServiceItemType } from "@/types/service-item"
import { WorkOrder as BaseWorkOrder } from "@/types"

export interface WorkOrderFormValues {
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  customer_phone: string
  contact_preference: "phone" | "email"
  vehicle_make: string
  vehicle_model: string
  vehicle_year: number
  vehicle_vin: string
  vehicle_color?: string
  vehicle_body_class?: string
  vehicle_doors?: number | null
  vehicle_trim?: string
  vehicle_license_plate?: string
  additional_notes?: string
  media_url?: string | null
  customer_address?: string
  customer_street_address?: string
  customer_unit_number?: string
  customer_city?: string
  customer_state_province?: string
  customer_postal_code?: string
  customer_country?: string
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

// Extending the BaseWorkOrder type to include the additional fields
export interface WorkOrder extends BaseWorkOrder {
  vehicle_color?: string
  vehicle_body_class?: string
  vehicle_doors?: number | null
  vehicle_trim?: string
  vehicle_license_plate?: string
}
