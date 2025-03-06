
import { ServiceItemType } from "@/types/service-item";
import { WorkOrderFormValues } from "@/components/work-orders/types";

export interface EstimateFormValues extends WorkOrderFormValues {
  total: number;
  services?: ServiceItemType[];
}
