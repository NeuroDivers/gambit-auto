
export interface ServiceItemType {
  service_id: string;
  service_name: string;
  quantity: number;
  unit_price: number;
  commission_rate: number;
  commission_type: 'percentage' | 'flat' | 'flat_rate' | null;
  assigned_profile_id?: string | null;
  description?: string;
  sub_services?: ServiceItemType[];
  is_parent?: boolean;
  parent_id?: string;
  package_id?: string | null;
}

export interface ServiceFormData {
  service_type: string;
  quantity?: number;
  details?: Record<string, any>;
  images?: string[];
  vehicleInfo?: {
    make: string;
    model: string;
    year: number;
    vin?: string;
    color?: string;
  };
  description?: string;
  service_items?: string[];
  service_details?: Record<string, any>;
}
