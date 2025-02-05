import { WorkOrder as BaseWorkOrder } from "@/types"

export type WorkOrder = BaseWorkOrder

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
}

export type WorkOrderFormProps = {
  workOrder?: WorkOrder
  onSuccess?: () => void
  defaultStartTime?: Date
}

export type ServiceItemType = {
  service_id: string
  service_name: string
  quantity: number
  unit_price: number
}

export type ServiceListProps = {
  workOrderServices: ServiceItemType[]
  onServicesChange: (services: ServiceItemType[]) => void
  disabled?: boolean
}