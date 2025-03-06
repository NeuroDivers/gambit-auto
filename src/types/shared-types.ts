
// Customer Information Types
export interface CustomerInfo {
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address?: string;
  customer_street_address?: string;
  customer_unit_number?: string;
  customer_city?: string;
  customer_state_province?: string;
  customer_postal_code?: string;
  customer_country?: string;
}

// Vehicle Information Types
export interface VehicleInfo {
  customer_vehicle_make: string;
  customer_vehicle_model: string;
  customer_vehicle_year: number | string;
  customer_vehicle_vin?: string;
  customer_vehicle_color?: string;
  customer_vehicle_trim?: string;
  customer_vehicle_body_class?: string;
  customer_vehicle_doors?: number;
  customer_vehicle_license_plate?: string;
}

// Combined type for forms and records that require both
export interface CustomerVehicleInfo extends CustomerInfo, VehicleInfo {}

// For database record types that might have null fields
export interface CustomerRecordInfo {
  customer_first_name: string | null;
  customer_last_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_address?: string | null;
  customer_street_address?: string | null;
  customer_unit_number?: string | null;
  customer_city?: string | null;
  customer_state_province?: string | null;
  customer_postal_code?: string | null;
  customer_country?: string | null;
}

export interface VehicleRecordInfo {
  customer_vehicle_make: string | null;
  customer_vehicle_model: string | null;
  customer_vehicle_year: number | string | null;
  customer_vehicle_vin?: string | null;
  customer_vehicle_color?: string | null;
  customer_vehicle_trim?: string | null;
  customer_vehicle_body_class?: string | null;
  customer_vehicle_doors?: number | null;
  customer_vehicle_license_plate?: string | null;
}

export interface CustomerVehicleRecordInfo extends CustomerRecordInfo, VehicleRecordInfo {}
