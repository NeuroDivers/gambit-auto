
export interface Vehicle {
  id: string
  customer_id: string
  make: string
  model: string
  year: number
  vin?: string | null
  color?: string | null
  license_plate?: string | null
  notes?: string | null
  is_primary: boolean
  body_class?: string | null
  doors?: number | null
  trim?: string | null
  created_at: string
  updated_at: string
}

export interface VehicleFormValues {
  make: string
  model: string
  year: number
  vin?: string
  color?: string
  license_plate?: string
  notes?: string
  is_primary: boolean
  body_class?: string
  doors?: number
  trim?: string
}
