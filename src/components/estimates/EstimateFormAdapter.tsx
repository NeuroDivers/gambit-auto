
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
 * Since the EstimateFormValues interface now includes all fields from
 * WorkOrderFormValues with the same field names, we can use a simple
 * type assertion.
 */
export function EstimateFormAdapter({ form, children }: EstimateFormAdapterProps) {
  // We can now safely cast the form since the interfaces are compatible
  const adaptedForm = form as unknown as UseFormReturn<WorkOrderFormValues>;
  
  return <>{children}</>;
}
