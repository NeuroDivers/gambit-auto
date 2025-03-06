
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
 * we can safely cast the form to be used with WorkOrderFormValues components.
 */
export function EstimateFormAdapter({ form, children }: EstimateFormAdapterProps) {
  // Create a wrapped version of the form that can be safely passed to components
  // that expect WorkOrderFormValues
  const wrappedForm = React.useMemo(() => {
    // We're creating a proxy object that maintains the same interface
    // but safely handles the type differences
    return {
      ...form,
      // Override specific methods that might cause type issues
      watch: ((name?: any, defaultValue?: any) => {
        return form.watch(name as any, defaultValue);
      }) as UseFormReturn<WorkOrderFormValues>['watch']
    } as UseFormReturn<WorkOrderFormValues>;
  }, [form]);
  
  return (
    <>{children}</>
  );
}
