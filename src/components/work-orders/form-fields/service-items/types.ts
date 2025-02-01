export type ServiceType = {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export type ServiceItemType = {
  service_id: string;
  service_name: string;
  quantity: number;
  unit_price: number;
}