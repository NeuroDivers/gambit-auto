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
  additional_notes: string
  timeframe: string
  address: string
  services: Array<{
    id: string
    name: string
  }>
}

export type WorkOrderFormProps = {
  workOrder?: WorkOrder
  onSuccess?: () => void
}