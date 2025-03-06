
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormValues } from "@/components/work-orders/types";
import { EstimateFormValues } from "./types/estimate-form";
import React, { useEffect } from 'react';

interface EstimateFormAdapterProps {
  form: UseFormReturn<EstimateFormValues>;
  children: React.ReactNode;
}

/**
 * This component adapts an EstimateForm to be compatible with components
 * that expect a WorkOrderFormValues form by using a more explicit type cast 
 * and ensuring field compatibility.
 */
export function EstimateFormAdapter({ form, children }: EstimateFormAdapterProps) {
  // Handle synchronization between notes and additional_notes
  useEffect(() => {
    const subscription = form.watch((value) => {
      // Sync notes to additional_notes when notes changes
      if (value.notes !== undefined && value.notes !== value.additional_notes) {
        form.setValue('additional_notes', value.notes);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  // Use a type assertion with as unknown first to avoid direct incompatible conversion
  const adaptedForm = form as unknown as UseFormReturn<WorkOrderFormValues>;
  
  return (
    <>{children}</>
  );
}
