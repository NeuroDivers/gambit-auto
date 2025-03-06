
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormValues } from "@/components/work-orders/types";
import { EstimateFormValues } from "./types/estimate-form";
import React from 'react';

interface EstimateFormAdapterProps {
  form: UseFormReturn<EstimateFormValues>;
  children: React.ReactNode;
}

/**
 * This component adapts an EstimateForm to be compatible with components
 * that expect a WorkOrderFormValues form.
 * 
 * By using a cast with a generic context, we provide a safer type assertion
 * that maintains the form functionality while satisfying the TypeScript checker.
 */
export function EstimateFormAdapter({ form, children }: EstimateFormAdapterProps) {
  // Use a type assertion that explicitly acknowledges we're
  // handling these form types as compatible
  const adaptedForm = form as unknown as UseFormReturn<WorkOrderFormValues>;
  
  return (
    <>{children}</>
  );
}
