
import { ServiceType } from "@/integrations/supabase/types/service-types";

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

export interface ServiceItemProps {
  service: ServiceItemType;
  availableServices: ServiceType[];
  onRemove: () => void;
  onChange: (updatedService: ServiceItemType) => void;
}

export interface ServiceDropdownProps {
  selectedService?: string | ServiceType;
  selectedServiceName?: string;
  servicesByType: ServicesByType;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleServiceSelect: (serviceId: string) => void;
  serviceId: string;
}

export interface ServiceDescriptionProps {
  service?: ServiceItemType | ServiceType;
  selectedServiceId?: string;
  servicesByType?: ServicesByType;
  expanded: boolean;
  onExpandToggle: () => void;
}

export interface ServicesByType {
  available: ServiceType[];
  [key: string]: ServiceType[];
}
