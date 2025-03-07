
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormValues } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Combobox } from "@/components/ui/combobox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";

interface CustomerSearchProps {
  form: UseFormReturn<WorkOrderFormValues>;
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
        .order("first_name", { ascending: true });

      if (error) throw error;
      console.log("Fetched customers:", data);
      return data || [];
    },
  });

  const filteredCustomers = customers?.filter(
    (customer) =>
      customer.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      customer.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      customer.email?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleSelect = async (selectedValue: string) => {
    setValue(selectedValue);
    setOpen(false);

    const selectedCustomer = customers?.find(
      (customer) => customer.id === selectedValue
    );

    if (selectedCustomer) {
      // Set customer information
      form.setValue("customer_first_name", selectedCustomer.first_name || "");
      form.setValue("customer_last_name", selectedCustomer.last_name || "");
      form.setValue("customer_email", selectedCustomer.email || "");
      form.setValue("customer_phone", selectedCustomer.phone_number || "");
      form.setValue("customer_street_address", selectedCustomer.street_address || "");
      form.setValue("customer_unit_number", selectedCustomer.unit_number || "");
      form.setValue("customer_city", selectedCustomer.city || "");
      form.setValue("customer_state_province", selectedCustomer.state_province || "");
      form.setValue("customer_postal_code", selectedCustomer.postal_code || "");
      form.setValue("customer_country", selectedCustomer.country || "");
      form.setValue("customer_address", [
        selectedCustomer.street_address,
        selectedCustomer.city,
        selectedCustomer.state_province,
        selectedCustomer.postal_code
      ].filter(Boolean).join(", "));
      
      // Set client_id for vehicle saving
      form.setValue("client_id", selectedCustomer.id);

      // Check if customer has any vehicles
      try {
        const { data: vehicles, error } = await supabase
          .from("vehicles")
          .select("*")
          .eq("customer_id", selectedCustomer.id)
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
        console.error("Error fetching vehicles:", error);
        toast.error("Error loading customer vehicles");
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
              label: `${customer.first_name} ${customer.last_name} (${customer.email})`,
            })) || []
          }
          value={value}
          onChange={handleSelect}
          onSearch={setSearch}
          placeholder="Search for a customer"
          isLoading={isLoading}
          emptyText="No customers found"
          noItemSelectedText="Select a customer"
        />
      </CardContent>
    </Card>
  );
}
