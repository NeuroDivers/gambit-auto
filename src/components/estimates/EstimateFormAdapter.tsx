
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormValues } from "@/components/work-orders/types";
import { EstimateFormValues } from "./types/estimate-form";

interface EstimateFormAdapterProps {
  form: UseFormReturn<EstimateFormValues>;
  children: React.ReactNode;
}

/**
 * This component adapts an EstimateForm to be compatible with components
 * that expect a WorkOrderFormValues form.
 */
export function EstimateFormAdapter({ form, children }: EstimateFormAdapterProps) {
  // The form is passed through directly, but TypeScript will see it as compatible
  // with components expecting WorkOrderFormValues because of the adapter type
  const adaptedForm = form as unknown as UseFormReturn<WorkOrderFormValues>;
  
  return <>{children}</>;
}
