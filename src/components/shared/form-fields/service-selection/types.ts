
export interface ServicesByType {
  [key: string]: {
    id: string;
    name: string;
    description?: string;
    price?: number;
  }[];
}

export interface ServiceDropdownProps {
  selectedValue: string;
  onServiceSelect: (serviceId: string, serviceName: string) => void;
  servicesList: ServicesByType;
  isDisabled?: boolean;
}

export interface ServiceDescriptionProps {
  selectedServiceId: string;
  servicesList: ServicesByType;
  expanded: boolean;
  onExpandToggle: () => void;
}
