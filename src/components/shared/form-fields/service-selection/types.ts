
export interface ServiceItemType {
  service_id: string;
  service_name: string;
  quantity: number;
  unit_price: number;
  commission_rate: number;
  commission_type: 'percentage' | 'fixed' | null;
  description?: string;
  is_parent?: boolean;
  sub_services?: ServiceItemType[];
  parent_id?: string | null;
  assigned_profile_id?: string | null;
  package_id?: string | null;
  staff_assignments?: {
    profile_id: string;
    commission_rate: number;
    commission_type: 'percentage' | 'fixed';
    notes?: string;
  }[];
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
}

export interface ServiceItemProps {
  service: ServiceItemType;
  onEdit: (service: ServiceItemType) => void;
  onRemove: (serviceId: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  availableServices?: any[];
  onChange?: (service: ServiceItemType) => void;
}

export interface ServiceItemFormProps {
  service: ServiceItemType;
  onUpdate: (updatedService: ServiceItemType) => void;
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
  description: string;
  onChange: (value: string) => void;
  selectedServiceId?: string;
  servicesByType?: ServicesByType;
  expanded?: boolean;
  onExpandToggle?: () => void;
}

export interface ServiceSelectionFieldProps {
  services: ServiceItemType[];
  onChange: (services: ServiceItemType[]) => void;
  showCommission?: boolean;
  showAssignedStaff?: boolean;
  disabled?: boolean;
  allowPriceEdit?: boolean;
  onServicesChange?: (services: ServiceItemType[]) => void;
}

export type ServicesByType = Record<string, any[]>;
