
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
 * Since EstimateFormValues properly extends WorkOrderFormValues, 
 * we can simply cast the form to the expected type.
 */
export function EstimateFormAdapter({ form, children }: EstimateFormAdapterProps) {
  // Cast to the expected type for components that use WorkOrderFormValues
  const adaptedForm = form as unknown as UseFormReturn<WorkOrderFormValues>;
  
  return (
    <>{children}</>
  );
}
