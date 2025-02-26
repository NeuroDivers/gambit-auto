
export interface ServicesByType {
  [key: string]: ServiceType[];
}

export interface ServiceType {
  id: string;
  name: string;
  description?: string;
  price?: number;
}

export interface ServiceDropdownProps {
  selectedValue?: string;
  onServiceSelect: (serviceId: string, serviceName: string) => void;
  servicesList: ServicesByType;
  isDisabled?: boolean;
}

export interface ServiceDescriptionProps {
  selectedServiceId?: string;
  servicesList: ServicesByType;
  expanded: boolean;
  onExpandToggle: () => void;
}

export interface ServiceItemProps {
  index: number;
  service: ServiceItemType;
  availableServices: ServiceType[];
  onRemove: () => void;
  onChange: (service: ServiceItemType) => void;
}

export interface ServiceItemType {
  service_id: string;
  service_name: string;
  quantity: number;
  unit_price: number;
  description?: string;
  commission_rate: number;
  commission_type: 'percentage' | 'flat' | null;
  assigned_profile_id?: string | null;
}
