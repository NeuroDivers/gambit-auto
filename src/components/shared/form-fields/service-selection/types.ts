
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
  selectedServiceName?: string;
  servicesByType: ServicesByType;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleServiceSelect: (value: string) => void;
  serviceId?: string;
}

export interface ServiceDescriptionProps {
  selectedServiceId?: string;
  servicesByType: ServicesByType;
  expanded: boolean;
  onExpandToggle: () => void;
}

export interface ServiceItemProps {
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
