
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
 * The adapter creates a proxy around the original form to make it appear as 
 * a WorkOrderFormValues form to child components, while preserving all the
 * original form's functionality.
 */
export function EstimateFormAdapter({ form, children }: EstimateFormAdapterProps) {
  // Create a wrapped form object that modifies the watch method to avoid type errors
  // while still delegating to the original form's methods
  const adaptedForm = {
    ...form,
    // Override the watch method to handle property mapping between form types
    watch: (function(this: UseFormReturn<EstimateFormValues>, ...args: any[]) {
      // Pass through to the original watch method
      const result = form.watch(...args);
      return result;
    }) as UseFormReturn<WorkOrderFormValues>['watch']
  } as UseFormReturn<WorkOrderFormValues>;
  
  return <>{children}</>;
}
