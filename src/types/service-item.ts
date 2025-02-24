
export interface ServiceItemType {
  service_id: string
  service_name: string
  quantity: number
  unit_price: number
  description?: string
  commission_rate: number | null
  commission_type: 'percentage' | 'flat' | null
  package_id?: string
}

export interface EstimateItem extends ServiceItemType {
  quote_id?: string
  quote_request_id?: string
}

export interface VehicleInfo {
  make: string
  model: string
  year: number
  vin: string
  saveToAccount?: boolean
}

export interface ServiceFormData {
  vehicleInfo: VehicleInfo
  service_items: ServiceItemType[]
  description: string
  service_details: Record<string, any>
}
