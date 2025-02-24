export interface ServiceItemType {
  service_id: string
  service_name: string
  quantity: number
  unit_price: number
  commission_rate?: number | null
  commission_type?: 'percentage' | 'flat' | null
}
