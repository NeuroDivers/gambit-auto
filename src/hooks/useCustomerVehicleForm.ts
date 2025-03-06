
import { CustomerVehicleInfo } from "@/types/shared-types";
import { useVinLookup } from "./useVinLookup";
import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";

export function useCustomerVehicleForm<T extends CustomerVehicleInfo>(
  form: UseFormReturn<T>,
  loadData?: Partial<CustomerVehicleInfo>
) {
  // Watch VIN to autofill other fields
  const vin = form.watch("customer_vehicle_vin");
  const { data: vinData, isLoading: isLoadingVin } = useVinLookup(vin);

  // Auto-fill vehicle information when VIN data is available
  useEffect(() => {
    if (vinData && !vinData.error) {
      if (vinData.make) form.setValue("customer_vehicle_make", vinData.make as any);
      if (vinData.model) form.setValue("customer_vehicle_model", vinData.model as any);
      if (vinData.year) form.setValue("customer_vehicle_year", vinData.year as any);
      if (vinData.color) form.setValue("customer_vehicle_color", vinData.color as any);
      if (vinData.bodyClass) form.setValue("customer_vehicle_body_class", vinData.bodyClass as any);
      if (vinData.doors) form.setValue("customer_vehicle_doors", vinData.doors as any);
      if (vinData.trim) form.setValue("customer_vehicle_trim", vinData.trim as any);
    }
  }, [vinData, form]);

  // Load initial data if provided
  useEffect(() => {
    if (loadData) {
      Object.entries(loadData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          form.setValue(key as any, value as any);
        }
      });
    }
  }, [loadData, form]);

  return {
    isLoadingVin,
    resetVehicleInfo: () => {
      form.setValue("customer_vehicle_make", "" as any);
      form.setValue("customer_vehicle_model", "" as any);
      form.setValue("customer_vehicle_year", new Date().getFullYear() as any);
      form.setValue("customer_vehicle_vin", "" as any);
      form.setValue("customer_vehicle_color", "" as any);
      form.setValue("customer_vehicle_body_class", "" as any);
      form.setValue("customer_vehicle_doors", null as any);
      form.setValue("customer_vehicle_trim", "" as any);
      form.setValue("customer_vehicle_license_plate", "" as any);
    }
  };
}
