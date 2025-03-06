
import { ServiceItemType, WorkOrderFormValues } from "@/components/work-orders/types";

export interface EstimateFormValues extends Omit<WorkOrderFormValues, 'service_items'> {
  total: number;
  services?: ServiceItemType[];
  service_items: ServiceItemType[];
}
