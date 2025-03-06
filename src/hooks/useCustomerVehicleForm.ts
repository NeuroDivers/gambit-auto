
import { UseFormReturn } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useCallback } from "react";

/**
 * Helper hook to handle vehicle data for any form type
 */
export function useCustomerVehicleForm<T>(form: UseFormReturn<T>) {
  const fetchVehicleDetails = useCallback(async (vin: string) => {
    try {
      // Try to find existing VIN data
      const { data: existingVin, error: lookupError } = await supabase
        .from('vin_lookups')
        .select('*')
        .eq('vin', vin)
        .eq('success', true)
        .maybeSingle();

      if (existingVin?.make && existingVin?.model && existingVin?.year) {
        // Set the form values using as any to bypass TypeScript's strict typing
        // This is necessary because we can't know the exact form structure in a generic hook
        (form.setValue as any)('customer_vehicle_make', existingVin.make);
        (form.setValue as any)('customer_vehicle_model', existingVin.model);
        (form.setValue as any)('customer_vehicle_year', existingVin.year);
        (form.setValue as any)('customer_vehicle_color', existingVin.raw_data?.color || '');
        (form.setValue as any)('customer_vehicle_body_class', existingVin.raw_data?.body_class || '');
        (form.setValue as any)('customer_vehicle_doors', existingVin.raw_data?.doors || 0);
        (form.setValue as any)('customer_vehicle_trim', existingVin.trim || '');
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error fetching VIN details:', error);
      return false;
    }
  }, [form]);

  const setVehicleData = useCallback((vehicleData: any) => {
    if (!vehicleData) return;
    
    // Set the form values using as any to bypass TypeScript's strict typing
    (form.setValue as any)('customer_vehicle_make', vehicleData.make || '');
    (form.setValue as any)('customer_vehicle_model', vehicleData.model || '');
    (form.setValue as any)('customer_vehicle_year', vehicleData.year || new Date().getFullYear());
    (form.setValue as any)('customer_vehicle_vin', vehicleData.vin || '');
    (form.setValue as any)('customer_vehicle_color', vehicleData.color || '');
    (form.setValue as any)('customer_vehicle_body_class', vehicleData.body_class || '');
    (form.setValue as any)('customer_vehicle_doors', vehicleData.doors || 0);
    (form.setValue as any)('customer_vehicle_trim', vehicleData.trim || '');
    (form.setValue as any)('customer_vehicle_license_plate', vehicleData.license_plate || '');
  }, [form]);

  return {
    fetchVehicleDetails,
    setVehicleData
  };
}
