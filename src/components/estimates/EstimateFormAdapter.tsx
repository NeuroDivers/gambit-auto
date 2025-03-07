
import { ReactNode } from "react";
import { UseFormReturn } from "react-hook-form";
import { EstimateFormValues } from "./types/estimate-form";
import { WorkOrderFormValues } from "../work-orders/types";

interface EstimateFormAdapterProps {
  children: ReactNode | ((form: UseFormReturn<WorkOrderFormValues>) => ReactNode);
  form: UseFormReturn<EstimateFormValues>;
}

/**
 * A wrapper component that adapts the estimate form to work with form components
 * designed for work orders. This enables reuse of the same form components
 * across estimates and work orders.
 */
export function EstimateFormAdapter({ children, form }: EstimateFormAdapterProps) {
  // Create a proxy form object that maps estimate field names to work order field names
  const proxyForm = {
    ...form,
    // This proxy maps field accesses to the appropriate estimate form fields
    control: form.control,
    watch: (name?: any) => {
      // If watching a specific field, map it to the corresponding estimate field
      if (name) {
        return form.watch(name as any);
      }
      // If watching all fields, return all fields
      return form.watch();
    },
    setValue: (name: any, value: any, options?: any) => {
      // Map the field name to the corresponding estimate field name
      return form.setValue(name as any, value, options);
    },
    // Pass through other form methods
    handleSubmit: form.handleSubmit,
    getValues: form.getValues,
    formState: form.formState,
    reset: form.reset,
    register: form.register,
    trigger: form.trigger,
    getFieldState: form.getFieldState,
    clearErrors: form.clearErrors,
    setError: form.setError,
    setFocus: form.setFocus,
    unregister: form.unregister
  } as unknown as UseFormReturn<WorkOrderFormValues>;

  // Pass the proxy form to the children
  return (
    <>
      {typeof children === 'function'
        ? children(proxyForm)
        : children}
    </>
  );
}
