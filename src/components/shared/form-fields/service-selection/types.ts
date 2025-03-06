
import { ServiceItemType as BaseServiceItemType } from "@/types/service-item";

// Define shared service selection types
export interface ServiceType {
  id: string;
  name: string;
  description?: string;
  base_price?: number;
  parent_service_id?: string | null;
  hierarchy_type?: string;
}

export interface ServiceItemProps {
  service: BaseServiceItemType;
  onRemove?: (id: string) => void;
  onQuantityChange?: (id: string, quantity: number) => void;
  onPriceChange?: (id: string, price: number) => void;
  showPrice?: boolean;
  showQuantity?: boolean;
  onSelect?: (serviceId: string) => void;
  isSelected?: boolean;
  hideDescription?: boolean;
  showRemove?: boolean;
  showCommission?: boolean;
  disabled?: boolean;
}

export interface ServiceDescriptionProps {
  service: ServiceType | BaseServiceItemType;
  hideDescription?: boolean;
}

export interface ServiceDropdownProps {
  services: ServiceType[];
  selectedService?: string;
  onChange: (serviceId: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export interface ServicesByType {
  [key: string]: ServiceType[];
}

export interface ServiceItemFormProps {
  value: BaseServiceItemType;
  onChange: (value: BaseServiceItemType) => void;
  servicesByType?: ServicesByType;
  showQuantity?: boolean;
  showPrice?: boolean;
  showCommission?: boolean;
  disabled?: boolean;
}
