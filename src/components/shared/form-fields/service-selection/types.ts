
export interface ServiceItemFormProps {
  index: number;
  item: ServiceItemType;
  services: any[];
  onUpdate: (index: number, field: keyof ServiceItemType, value: any) => void;
  onRemove: () => void;
}

export interface ServiceType {
  id: string;
  name: string;
  price: number | null;
  description?: string;
  hierarchy_type?: string;
}

export interface ServiceItemType {
  service_id: string;
  service_name: string;
  quantity: number;
  unit_price: number;
}

export type ServicesByType = {
  [key: string]: ServiceType[];
}
