
import { ServiceItemType } from "@/types/service-item";
import { WorkOrderFormValues } from "@/components/work-orders/types";

/**
 * This interface defines the form values for the estimate form.
 * It extends WorkOrderFormValues to ensure compatibility with 
 * components that expect WorkOrderFormValues, while adding
 * estimate-specific fields.
 */
export interface EstimateFormValues extends WorkOrderFormValues {
  // Estimate-specific fields (not in WorkOrderFormValues)
  total: number;
  vehicle_id: string;
  
  // For backward compatibility 
  services?: ServiceItemType[];
}
