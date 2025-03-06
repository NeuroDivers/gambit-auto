
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
  package_id?: string | null
}

// Add the ServiceFormData type that was missing but referenced in other files
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
