
export interface ServiceItemType {
  service_id: string;
  service_name: string;
  quantity: number;
  unit_price: number;
  description?: string;
  commission_rate: number;
  commission_type: 'percentage' | 'flat' | null; // Standardized to 'flat' throughout
  assigned_profile_id?: string | null;
  package_id?: string;
  // Properties for sub-services
  is_parent?: boolean;
  sub_services?: ServiceItemType[];
  parent_id?: string;
}

export interface EstimateItem extends ServiceItemType {
  quote_id?: string;
  quote_request_id?: string;
}

export interface VehicleInfo {
  make: string;
  model: string;
  year: number;
  vin: string;
  color?: string;
  trim?: string;
  doors?: number;
  body_class?: string;
  license_plate?: string;
  saveToAccount?: boolean;
}

export interface ServiceFormData {
  vehicleInfo: VehicleInfo;
  service_items: ServiceItemType[];
  description: string;
  service_details: Record<string, any>;
}
