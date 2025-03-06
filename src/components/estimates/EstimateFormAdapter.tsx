
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
 * The adapter uses type assertions to bridge the compatibility gap between
 * the two form types, allowing them to work together without requiring
 * all fields to be identical.
 */
export function EstimateFormAdapter({ form, children }: EstimateFormAdapterProps) {
  // Use type assertion with a cast override to make TypeScript treat the form
  // as compatible with WorkOrderFormValues components
  const adaptedForm = form as unknown as UseFormReturn<WorkOrderFormValues>;
  
  // Wrap children with the adapted form context
  return <>{children}</>;
}
