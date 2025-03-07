
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormValues } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerInfoFields } from "@/components/invoices/form-sections/CustomerInfoFields";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CustomerSearchProps {
  form: UseFormReturn<WorkOrderFormValues>;
}

export function CustomerSearch({ form }: CustomerSearchProps) {
  const onCustomerSelect = async (customerId: string) => {
    try {
      // Set client_id for vehicle saving
      form.setValue("client_id", customerId);

      // Fetch customer vehicles when a customer is selected
      const { data: vehicles, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("customer_id", customerId)
        .order("is_primary", { ascending: false });

      if (error) {
        console.error("Error fetching customer vehicles:", error);
        return;
      }

      // If customer has vehicles, populate the first one (or primary)
      if (vehicles && vehicles.length > 0) {
        const primaryVehicle = vehicles.find(v => v.is_primary) || vehicles[0];
        
        form.setValue("customer_vehicle_make", primaryVehicle.make || "");
        form.setValue("customer_vehicle_model", primaryVehicle.model || "");
        form.setValue("customer_vehicle_year", primaryVehicle.year || new Date().getFullYear());
        form.setValue("customer_vehicle_vin", primaryVehicle.vin || "");
        
        if (primaryVehicle.color) {
          form.setValue("customer_vehicle_color", primaryVehicle.color);
        }
        if (primaryVehicle.trim) {
          form.setValue("customer_vehicle_trim", primaryVehicle.trim);
        }
        if (primaryVehicle.body_class) {
          form.setValue("customer_vehicle_body_class", primaryVehicle.body_class);
        }
        if (primaryVehicle.doors) {
          form.setValue("customer_vehicle_doors", primaryVehicle.doors);
        }
        if (primaryVehicle.license_plate) {
          form.setValue("customer_vehicle_license_plate", primaryVehicle.license_plate);
        }
        
        toast.success(`Vehicle loaded: ${primaryVehicle.year} ${primaryVehicle.make} ${primaryVehicle.model}`);
      }
    } catch (error: any) {
      console.error("Error loading customer data:", error);
      toast.error("Error loading customer data: " + error.message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Search</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <CustomerInfoFields
          customerFirstName={form.watch('customer_first_name')}
          setCustomerFirstName={(value) => form.setValue('customer_first_name', value)}
          customerLastName={form.watch('customer_last_name')}
          setCustomerLastName={(value) => form.setValue('customer_last_name', value)}
          customerEmail={form.watch('customer_email')}
          setCustomerEmail={(value) => form.setValue('customer_email', value)}
          customerPhone={form.watch('customer_phone')}
          setCustomerPhone={(value) => form.setValue('customer_phone', value)}
          customerStreetAddress={form.watch('customer_street_address')}
          setCustomerStreetAddress={(value) => form.setValue('customer_street_address', value)}
          customerUnitNumber={form.watch('customer_unit_number')}
          setCustomerUnitNumber={(value) => form.setValue('customer_unit_number', value)}
          customerCity={form.watch('customer_city')}
          setCustomerCity={(value) => form.setValue('customer_city', value)}
          customerStateProvince={form.watch('customer_state_province')}
          setCustomerStateProvince={(value) => form.setValue('customer_state_province', value)}
          customerPostalCode={form.watch('customer_postal_code')}
          setCustomerPostalCode={(value) => form.setValue('customer_postal_code', value)}
          customerCountry={form.watch('customer_country')}
          setCustomerCountry={(value) => form.setValue('customer_country', value)}
          onCustomerSelect={onCustomerSelect}
          setClientId={(value) => form.setValue('client_id', value)}
        />
      </CardContent>
    </Card>
  );
}
