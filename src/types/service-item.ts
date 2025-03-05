
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
  // Add this for compatibility with existing code
  services?: ServiceItemType[];
}

export interface PackageSelectProps {
  onSelect?: (packageServices: ServiceItemType[]) => void;
  onCancel?: () => void;
}

// Add ServiceFormData interface required by quote request components
export interface ServiceFormData {
  serviceType: string;
  details: {
    [key: string]: any;
  };
  images: File[];
  description: string;
}
