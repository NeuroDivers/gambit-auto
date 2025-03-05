
export type ServiceItemType = {
  service_id: string
  service_name: string
  description?: string
  quantity: number
  unit_price: number
  commission_rate: number
  commission_type: 'percentage' | 'flat' | null
  is_parent?: boolean
  sub_services?: ServiceItemType[]
  parent_id?: string
  assigned_profile_id?: string | null
}
