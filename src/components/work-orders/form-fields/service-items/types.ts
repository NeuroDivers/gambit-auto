export type ServiceType = {
  id: string
  name: string
  price: number | null
}

export type ServiceItemType = {
  service_id: string
  service_name: string
  quantity: number
  unit_price: number
}