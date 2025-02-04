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
  timeframe: "flexible" | "asap" | "within_week" | "within_month"
  address?: string
  service_items: Array<ServiceItemType>
  price: number
  scheduled_date?: Date | undefined
}

export type WorkOrderFormProps = {
  workOrder?: WorkOrder
  onSuccess?: () => void
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
}