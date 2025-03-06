
import { ServiceItemType } from "@/types/service-item";
import { WorkOrderFormValues } from "@/components/work-orders/types";

/**
 * This interface defines the form values for the estimate form.
 * It extends WorkOrderFormValues to ensure compatibility with 
 * components that expect WorkOrderFormValues, while adding
 * estimate-specific fields.
 */
export interface EstimateFormValues extends Omit<WorkOrderFormValues, 'additional_notes'> {
  // Estimate-specific fields (not in WorkOrderFormValues)
  notes: string;
  total: number;
  vehicle_id: string;
  
  // For backward compatibility
  services?: ServiceItemType[];
  
  // Re-include additional_notes from WorkOrderFormValues but make it optional
  // This allows us to sync between notes and additional_notes
  additional_notes?: string;
}
