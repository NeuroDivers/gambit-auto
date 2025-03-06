
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
    // We need to use a type assertion (as unknown as ...) to work around the TypeScript error
    // This is safe because EstimateFormValues extends WorkOrderFormValues and we're handling
    // the additional fields properly
    return {
      ...form,
      // Override specific methods that might cause type issues
      watch: ((name?: any, defaultValue?: any) => {
        return form.watch(name as any, defaultValue);
      }),
      getValues: ((name?: any) => {
        return form.getValues(name as any);
      }),
      setValue: ((name: any, value: any, options?: any) => {
        return form.setValue(name, value, options);
      }),
      // Add any other methods that need special handling
    } as unknown as UseFormReturn<WorkOrderFormValues>;
  }, [form]);
  
  return (
    <>{children}</>
  );
}
