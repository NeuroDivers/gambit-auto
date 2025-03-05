
export type ServiceItemType = {
  service_id: string
  service_name: string
  description: string 
  quantity: number
  unit_price: number
  commission_rate: number
  commission_type: 'percentage' | 'flat' | null
  is_parent?: boolean
  sub_services?: ServiceItemType[]
  parent_id?: string | null
  assigned_profile_id?: string | null
  package_id?: string | null
  // Support for multi-staff assignments
  assigned_profiles?: Array<{
    profile_id: string,
    commission_rate: number,
    commission_type: 'percentage' | 'flat' | null
  }>
}

export type ServiceFormData = {
  vehicleInfo: {
    make: string
    model: string
    year: number
    vin: string
    saveToAccount: boolean
  }
  service_items: ServiceItemType[]
  description: string
  service_details: Record<string, any>
}
