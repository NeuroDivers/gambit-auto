
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
}

export interface ServiceDropdownProps {
  service: ServiceItemType;
  onEdit: (service: ServiceItemType) => void;
  onRemove: (serviceId: string) => void;
}

export interface ServiceItemProps {
  service: ServiceItemType;
  onEdit: (service: ServiceItemType) => void;
  onRemove: (serviceId: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export interface ServiceItemFormProps {
  service: ServiceItemType;
  onUpdate: (updatedService: ServiceItemType) => void;
  onCancel: () => void;
  showCommission?: boolean;
  showAssignedStaff?: boolean;
}

export interface ServiceQuantityPriceProps {
  service: ServiceItemType;
  onChange: (field: string, value: any) => void;
}

export interface ServiceDescriptionProps {
  description: string;
  onChange: (value: string) => void;
}

export interface ServiceSelectionFieldProps {
  services: ServiceItemType[];
  onChange: (services: ServiceItemType[]) => void;
  showCommission?: boolean;
  showAssignedStaff?: boolean;
  disabled?: boolean;
}
