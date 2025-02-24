
export interface ServiceItemType {
  service_id: string
  service_name: string
  quantity: number
  unit_price: number
  commission_rate: number | null
  commission_type: 'percentage' | 'flat' | null
  description: string
}

export interface ServiceFormData {
  vehicleInfo: {
    make: string
    model: string
    year: number
    vin: string
    saveToAccount?: boolean
  }
  service_items: ServiceItemType[]
  description: string
  service_details: Record<string, any>
}
