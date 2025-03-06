
export type ServiceItemType = {
  service_id: string
  service_name: string
  description: string 
  quantity: number
  unit_price: number
  commission_rate: number
  commission_type: 'percentage' | 'fixed' | null
  is_parent?: boolean
  sub_services?: ServiceItemType[]
  parent_id?: string | null
  assigned_profile_id?: string | null
  package_id?: string | null
  // Add support for multiple staff assignments with different commission rates
  staff_assignments?: StaffAssignment[]
}

export type StaffAssignment = {
  profile_id: string
  commission_rate: number
  commission_type: 'percentage' | 'fixed'
  notes?: string
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
