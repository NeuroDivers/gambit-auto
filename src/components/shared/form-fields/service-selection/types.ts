
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

export interface ServiceDropdownProps {
  service: ServiceItemType;
  onEdit: (service: ServiceItemType) => void;
  onRemove: (serviceId: string) => void;
  selectedServiceName?: string;
  servicesByType?: Record<string, any[]>;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  handleServiceSelect?: (serviceId: string) => void;
  serviceId?: string;
  isLoading?: boolean;
}

export interface ServiceItemProps {
  service: ServiceItemType;
  onEdit: (service: ServiceItemType) => void;
  onRemove: (serviceId: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  availableServices?: any[];
  onChange?: (service: ServiceItemType) => void;
  isEditing?: boolean;
  onUpdate?: (updatedService: ServiceItemType) => void;
  onCancelEdit?: () => void;
  disabled?: boolean;
  showCommission?: boolean;
  showAssignedStaff?: boolean;
  serviceTypes?: any[];
}

export interface ServiceItemFormProps {
  service: ServiceItemType;
  onUpdate?: (updatedService: ServiceItemType) => void;
  onCancel: () => void;
  showCommission?: boolean;
  showAssignedStaff?: boolean;
  services?: ServicesByType;
  onRemove?: () => void;
  onChange?: (service: ServiceItemType) => void;
  disabled?: boolean;
}

export interface ServiceQuantityPriceProps {
  service: ServiceItemType;
  onChange: (field: string, value: any) => void;
}

export interface ServiceDescriptionProps {
  description?: string;
  onChange?: (value: string) => void;
  selectedServiceId?: string;
  servicesByType?: ServicesByType;
  expanded?: boolean;
  onExpandToggle?: () => void;
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

export type ServicesByType = Record<string, any[]>;
