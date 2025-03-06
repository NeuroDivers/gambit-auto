
import { CustomerVehicleInfo } from "@/types/shared-types";
import { ServiceItemType } from "@/components/work-orders/types";

export interface EstimateFormValues extends CustomerVehicleInfo {
  notes?: string;
  status?: string;
  total: number;
  services?: ServiceItemType[];
  service_items: ServiceItemType[];
}
