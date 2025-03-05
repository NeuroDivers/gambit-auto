
export interface ServiceItemType {
  service_id: string;
  service_name: string;
  quantity: number;
  unit_price: number;
  commission_rate: number;
  commission_type: 'percentage' | 'flat' | null;
  description?: string;
  is_parent?: boolean;
  sub_services?: ServiceItemType[];
  parent_id?: string | null;
  assigned_profile_id?: string | null;
  package_id?: string | null;
  // Support for multi-staff assignments
  assigned_profiles?: Array<{
    profile_id: string,
    commission_rate: number,
    commission_type: 'percentage' | 'flat' | null
  }>;
}

export interface ServiceSelectionFieldProps {
  value?: ServiceItemType[];
  onChange: (services: ServiceItemType[]) => void;
  showCommission?: boolean;
  showAssignedStaff?: boolean;
  disabled?: boolean;
  allowPriceEdit?: boolean;
  onServicesChange?: (services: ServiceItemType[]) => void;
  // Add these for compatibility with existing code
  services?: ServiceItemType[];
  name?: string;
  label?: string;
  description?: string;
}

export interface PackageSelectProps {
  onSelect?: (packageServices: ServiceItemType[]) => void;
  onCancel?: () => void;
}

// Expand the ServiceFormData interface to include all fields needed by quote request components
export interface ServiceFormData {
  serviceType: string;
  details: {
    [key: string]: any;
  };
  images: File[];
  description: string;
  // Additional fields needed by the quote request form
  vehicleInfo?: {
    make: string;
    model: string;
    year: number;
    vin: string;
    saveToAccount?: boolean;
  };
  service_items?: ServiceItemType[];
  service_details?: {
    [serviceId: string]: {
      description?: string;
      images?: string[];
      detail_type?: string;
      package_type?: string;
      tint_type?: string;
      [key: string]: any;
    };
  };
}
