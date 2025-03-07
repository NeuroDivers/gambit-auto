
export interface Vehicle {
  id: string;
  customer_id: string;
  client_id?: string;
  customer_vehicle_make: string;
  customer_vehicle_model: string;
  customer_vehicle_year: number;
  customer_vehicle_vin?: string | null;
  customer_vehicle_color?: string | null;
  customer_vehicle_license_plate?: string | null;
  notes?: string | null;
  is_primary: boolean;
  customer_vehicle_body_class?: string | null;
  customer_vehicle_doors?: number | null;
  customer_vehicle_trim?: string | null;
  created_at: string;
  updated_at: string;
  // Compatibility fields
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
  color?: string;
  license_plate?: string;
  body_class?: string;
  doors?: number;
  trim?: string;
}

export interface VehicleFormValues {
  customer_vehicle_make: string;
  customer_vehicle_model: string;
  customer_vehicle_year: number;
  customer_vehicle_vin?: string;
  customer_vehicle_color?: string;
  customer_vehicle_license_plate?: string;
  notes?: string;
  is_primary: boolean;
  customer_vehicle_body_class?: string;
  customer_vehicle_doors?: number;
  customer_vehicle_trim?: string;
}
