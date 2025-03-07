
import { useState, useEffect } from "react";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { EstimateFormValues } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import CustomerInfoFields from "@/components/invoices/form-sections/CustomerInfoFields";

interface CustomerSearchProps {
  form: UseFormReturn<EstimateFormValues>;
}

export function CustomerSearch({ form }: CustomerSearchProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Fetch customers
  const { data: customers = [], isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('customer_last_name', { ascending: true });

      if (error) throw error;
      return data || [];
    }
  });

  // Handle customer selection
  const handleCustomerSelect = async (customerId: string) => {
    setSelectedCustomerId(customerId);
    
    // Find the selected customer
    const selectedCustomer = customers.find(c => c.id === customerId);
    if (!selectedCustomer) return;
    
    // Set customer profile ID for the estimate
    // Using setValue with appropriate form field name
    if (form.getValues().hasOwnProperty('client_id')) {
      form.setValue('client_id' as any, selectedCustomer.profile_id);
    }
    
    // Fetch customer vehicles if available
    if (selectedCustomer.profile_id) {
      const { data: vehicles } = await supabase
        .from('customer_vehicles')
        .select('*')
        .eq('profile_id', selectedCustomer.profile_id)
        .order('created_at', { ascending: false });
      
      if (vehicles && vehicles.length > 0) {
        const latestVehicle = vehicles[0];
        
        // Set vehicle information using appropriate form field names
        if (form.getValues().hasOwnProperty('customer_vehicle_make')) {
          form.setValue('customer_vehicle_make' as any, latestVehicle.make || '');
          form.setValue('customer_vehicle_model' as any, latestVehicle.model || '');
          form.setValue('customer_vehicle_year' as any, latestVehicle.year || '');
          form.setValue('customer_vehicle_vin' as any, latestVehicle.vin || '');
        }
      }
    }
  };

  // Reset form when unmounting
  useEffect(() => {
    return () => {
      form.reset();
    };
  }, [form]);

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name={'customer_first_name' as any}
        render={() => (
          <FormItem>
            <FormLabel>Customer Information</FormLabel>
            <CustomerInfoFields
              customerFirstName={form.watch('customer_first_name')}
              setCustomerFirstName={(value) => form.setValue('customer_first_name', value)}
              customerLastName={form.watch('customer_last_name')}
              setCustomerLastName={(value) => form.setValue('customer_last_name', value)}
              customerEmail={form.watch('customer_email')}
              setCustomerEmail={(value) => form.setValue('customer_email', value)}
              customerPhone={form.watch('customer_phone')}
              setCustomerPhone={(value) => form.setValue('customer_phone', value)}
              customerAddress={form.watch('customer_address')}
              setCustomerAddress={(value) => form.setValue('customer_address', value)}
              customers={customers}
              isLoadingCustomers={isLoadingCustomers}
              onCustomerSelect={handleCustomerSelect}
              setClientId={(value) => {
                if (form.getValues().hasOwnProperty('client_id')) {
                  form.setValue('client_id' as any, value);
                }
              }}
            />
          </FormItem>
        )}
      />
    </div>
  );
}
