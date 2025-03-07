
import { UseFormReturn } from "react-hook-form";
import { EstimateFormValues } from "../types/estimate-form";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Combobox } from "@/components/ui/combobox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

interface CustomerSearchProps {
  form: UseFormReturn<EstimateFormValues>;
}

export function CustomerSearch({ form }: CustomerSearchProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [search, setSearch] = useState("");

  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("customer_first_name", { ascending: true });

      if (error) {
        console.error("Error fetching customers:", error);
        throw error;
      }
      console.log("Fetched customers:", data);
      return data || [];
    },
  });

  const filteredCustomers = customers
    ? customers.filter(
        (customer) =>
          customer.customer_first_name?.toLowerCase().includes(search.toLowerCase()) ||
          customer.customer_last_name?.toLowerCase().includes(search.toLowerCase()) ||
          customer.customer_email?.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const handleSelect = async (selectedValue: string) => {
    setValue(selectedValue);
    setOpen(false);

    const selectedCustomer = customers?.find(
      (customer) => customer.id === selectedValue
    );

    if (selectedCustomer) {
      try {
        // Set customer information
        form.setValue("customer_first_name", selectedCustomer.customer_first_name || "");
        form.setValue("customer_last_name", selectedCustomer.customer_last_name || "");
        form.setValue("customer_email", selectedCustomer.customer_email || "");
        form.setValue("customer_phone", selectedCustomer.customer_phone || "");
        form.setValue("customer_street_address", selectedCustomer.customer_street_address || "");
        form.setValue("customer_unit_number", selectedCustomer.customer_unit_number || "");
        form.setValue("customer_city", selectedCustomer.customer_city || "");
        form.setValue("customer_state_province", selectedCustomer.customer_state_province || "");
        form.setValue("customer_postal_code", selectedCustomer.customer_postal_code || "");
        form.setValue("customer_country", selectedCustomer.customer_country || "");
        
        // Fetch customer vehicles
        const { data: vehicles, error } = await supabase
          .from("vehicles")
          .select("*")
          .eq("customer_id", selectedCustomer.id)
          .order("is_primary", { ascending: false });
          
        if (error) {
          throw error;
        }
        
        // If customer has vehicles, set the primary vehicle or first vehicle
        if (vehicles && vehicles.length > 0) {
          // Find primary vehicle or use first vehicle as fallback
          const primaryVehicle = vehicles.find(v => v.is_primary) || vehicles[0];
          
          form.setValue("vehicle_make", primaryVehicle.make || "");
          form.setValue("vehicle_model", primaryVehicle.model || "");
          form.setValue("vehicle_year", primaryVehicle.year || new Date().getFullYear());
          form.setValue("vehicle_vin", primaryVehicle.vin || "");
          
          if (primaryVehicle.color) {
            form.setValue("vehicle_color", primaryVehicle.color);
          }
          if (primaryVehicle.trim) {
            form.setValue("vehicle_trim", primaryVehicle.trim);
          }
          if (primaryVehicle.body_class) {
            form.setValue("vehicle_body_class", primaryVehicle.body_class);
          }
          if (primaryVehicle.doors) {
            form.setValue("vehicle_doors", primaryVehicle.doors);
          }
          if (primaryVehicle.license_plate) {
            form.setValue("vehicle_license_plate", primaryVehicle.license_plate);
          }
          
          toast({
            title: "Vehicle information loaded",
            description: `Using ${primaryVehicle.is_primary ? "primary" : "first"} vehicle: ${primaryVehicle.year} ${primaryVehicle.make} ${primaryVehicle.model}`,
          });
        }
      } catch (error: any) {
        console.error("Error loading customer data:", error);
        toast({
          variant: "destructive",
          title: "Error loading customer data",
          description: error.message,
        });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Search</CardTitle>
      </CardHeader>
      <CardContent>
        <Combobox
          items={
            filteredCustomers.map((customer) => ({
              value: customer.id,
              label: `${customer.customer_first_name} ${customer.customer_last_name} (${customer.customer_email || "No email"})`,
            })) || []
          }
          value={value}
          onChange={handleSelect}
          onSearch={setSearch}
          placeholder="Search for a customer"
          isLoading={isLoading}
          emptyText="No customers found"
          noItemSelectedText="Select a customer to auto-fill"
        />
      </CardContent>
    </Card>
  );
}
