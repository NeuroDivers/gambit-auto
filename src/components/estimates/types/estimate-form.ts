
import { CustomerVehicleInfo } from "@/types/shared-types";
import { ServiceItemType } from "@/components/work-orders/types";

export interface EstimateFormValues extends CustomerVehicleInfo {
  notes?: string;
  status?: string;
  total: number;
  services?: ServiceItemType[];
  service_items: ServiceItemType[];
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  vehicle_vin?: string;
  vehicle_color?: string;
  vehicle_trim?: string;
  vehicle_body_class?: string;
  vehicle_doors?: number;
  vehicle_license_plate?: string;
  additional_notes?: string;
  contact_preference?: 'phone' | 'email';
}
