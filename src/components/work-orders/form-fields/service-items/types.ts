export type ServiceItemType = {
  service_id: string
  service_name: string
  quantity: number
  unit_price: number
}

export type ServiceItemsFieldProps = {
  items: ServiceItemType[]
  setItems: (items: ServiceItemType[]) => void
}