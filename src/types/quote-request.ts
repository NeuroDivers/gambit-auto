
export type QuoteRequestStatus = "pending" | "estimated" | "accepted" | "rejected" | "converted";

export type ServiceItemType = {
  service_id: string;
  service_name: string;
  quantity: number;
  unit_price: number;
}

export type ServiceDetail = {
  description?: string;
  images?: string[];
  package_id?: string;
}

export type PPFServiceDetail = ServiceDetail & {
  package_type: 'partial_front' | 'full_front' | 'track_pack' | 'full_vehicle';
}

export type WindowTintServiceDetail = ServiceDetail & {
  tint_type: 'two_front' | 'front_and_rear' | 'complete';
}

export type AutoDetailServiceDetail = ServiceDetail & {
  detail_type: 'interior' | 'exterior' | 'both';
}

export type ServiceDetails = {
  [serviceId: string]: ServiceDetail | PPFServiceDetail | WindowTintServiceDetail | AutoDetailServiceDetail;
}

export type QuoteRequestFormData = {
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    vin: string;
    saveToAccount?: boolean;
  };
  service_items: ServiceItemType[];
  description: string;
  service_details: ServiceDetails;
}

export type ClientInfo = {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone_number: string | null;
}

export type QuoteRequest = {
  id: string
  client_id: string
  client?: ClientInfo
  status: QuoteRequestStatus
  vehicle_make: string | null
  vehicle_model: string | null
  vehicle_year: number | null
  vehicle_vin: string | null
  description: string | null
  estimated_amount: number | null
  client_response: "accepted" | "rejected" | null
  created_at: string
  media_urls: string[] | null
  service_details: Record<string, any> | null
  service_ids: string[]
  service_estimates?: Record<string, number>
  is_archived: boolean
}
