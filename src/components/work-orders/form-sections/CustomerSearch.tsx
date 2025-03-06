
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormValues } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Combobox } from "@/components/ui/combobox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

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
        .order("customer_first_name", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const filteredCustomers = customers?.filter(
    (customer) =>
      customer.customer_first_name?.toLowerCase().includes(search.toLowerCase()) ||
      customer.customer_last_name?.toLowerCase().includes(search.toLowerCase()) ||
      customer.customer_email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (selectedValue: string) => {
    setValue(selectedValue);
    setOpen(false);

    const selectedCustomer = customers?.find(
      (customer) => customer.id === selectedValue
    );

    if (selectedCustomer) {
      // Set customer information
      form.setValue("customer_first_name", selectedCustomer.customer_first_name || "");
      form.setValue("customer_last_name", selectedCustomer.customer_last_name || "");
      form.setValue("customer_email", selectedCustomer.customer_email || "");
      form.setValue("customer_phone", selectedCustomer.customer_phone_number || "");
      form.setValue("customer_street_address", selectedCustomer.customer_street_address || "");
      form.setValue("customer_unit_number", selectedCustomer.customer_unit_number || "");
      form.setValue("customer_city", selectedCustomer.customer_city || "");
      form.setValue("customer_state_province", selectedCustomer.customer_state_province || "");
      form.setValue("customer_postal_code", selectedCustomer.customer_postal_code || "");
      form.setValue("customer_country", selectedCustomer.customer_country || "");
      form.setValue("customer_address", [
        selectedCustomer.customer_street_address,
        selectedCustomer.customer_city,
        selectedCustomer.customer_state_province,
        selectedCustomer.customer_postal_code
      ].filter(Boolean).join(", "));
      
      // Set client_id for vehicle saving
      form.setValue("client_id", selectedCustomer.id);

      // Check if customer has any vehicles
      fetchCustomerVehicles(selectedCustomer.id);
    }
  };

  const fetchCustomerVehicles = async (customerId: string) => {
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
            filteredCustomers?.map((customer) => ({
              value: customer.id,
              label: `${customer.customer_first_name} ${customer.customer_last_name} (${customer.customer_email})`,
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
