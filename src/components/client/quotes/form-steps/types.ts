
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
  };
  service_items: Array<{
    service_id: string;
    service_name: string;
    quantity: number;
    unit_price: number;
  }>;
  description: string;
  service_details: ServiceDetails;
}
