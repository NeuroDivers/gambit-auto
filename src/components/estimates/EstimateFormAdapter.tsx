
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
 * Since EstimateFormValues now properly extends WorkOrderFormValues, 
 * we no longer need to synchronize fields manually.
 */
export function EstimateFormAdapter({ form, children }: EstimateFormAdapterProps) {
  // Use a type assertion to adapt the form
  const adaptedForm = form as unknown as UseFormReturn<WorkOrderFormValues>;
  
  return (
    <>{children}</>
  );
}
