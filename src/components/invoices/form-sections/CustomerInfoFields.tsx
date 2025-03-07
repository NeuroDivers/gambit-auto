
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { Card, CardContent } from "@/components/ui/card";
import { CustomerInfoFieldsProps } from "./CustomerInfoFieldsProps";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Search, User, UserPlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/useDebounce";

export function CustomerInfoFields({
  customerFirstName,
  setCustomerFirstName,
  customerLastName,
  setCustomerLastName,
  customerEmail,
  setCustomerEmail,
  customerPhone,
  setCustomerPhone,
  customerAddress,
  setCustomerAddress,
  customers = [],
  isLoadingCustomers = false,
  onCustomerSelect,
  customerStreetAddress,
  setCustomerStreetAddress,
  customerUnitNumber,
  setCustomerUnitNumber,
  customerCity,
  setCustomerCity,
  customerStateProvince,
  setCustomerStateProvince,
  customerPostalCode,
  setCustomerPostalCode,
  customerCountry,
  setCustomerCountry,
  setClientId
}: CustomerInfoFieldsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch customers from Supabase if none are provided
  const {
    data: fetchedCustomers = [],
    isLoading: isLoadingFetchedCustomers,
  } = useQuery({
    queryKey: ["customers", debouncedSearchTerm],
    queryFn: async () => {
      if (!debouncedSearchTerm || customers.length > 0) return [];

      const query = supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (debouncedSearchTerm) {
        query.or(
          `first_name.ilike.%${debouncedSearchTerm}%,last_name.ilike.%${debouncedSearchTerm}%,email.ilike.%${debouncedSearchTerm}%,phone.ilike.%${debouncedSearchTerm}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching customers:", error);
        return [];
      }

      return data || [];
    },
    enabled: debouncedSearchTerm.length > 0 && customers.length === 0,
  });

  const customersToUse = customers.length > 0 ? customers : fetchedCustomers;
  const isLoading = isLoadingCustomers || isLoadingFetchedCustomers;

  const handleCustomerSelect = (customerId: string) => {
    const selectedCustomer = customersToUse.find(c => c.id === customerId);

    if (selectedCustomer) {
      setCustomerFirstName(selectedCustomer.first_name || "");
      setCustomerLastName(selectedCustomer.last_name || "");
      setCustomerEmail(selectedCustomer.email || "");
      
      if (setCustomerPhone) {
        setCustomerPhone(selectedCustomer.phone || "");
      }
      
      // Handle address fields based on what's available in the component props
      if (setCustomerAddress && selectedCustomer.address) {
        setCustomerAddress(selectedCustomer.address);
      }
      
      // If using detailed address fields
      if (setCustomerStreetAddress && selectedCustomer.street_address) {
        setCustomerStreetAddress(selectedCustomer.street_address);
      }
      
      if (setCustomerUnitNumber && selectedCustomer.unit_number) {
        setCustomerUnitNumber(selectedCustomer.unit_number);
      }
      
      if (setCustomerCity && selectedCustomer.city) {
        setCustomerCity(selectedCustomer.city);
      }
      
      if (setCustomerStateProvince && selectedCustomer.state_province) {
        setCustomerStateProvince(selectedCustomer.state_province);
      }
      
      if (setCustomerPostalCode && selectedCustomer.postal_code) {
        setCustomerPostalCode(selectedCustomer.postal_code);
      }
      
      if (setCustomerCountry && selectedCustomer.country) {
        setCustomerCountry(selectedCustomer.country);
      }
      
      // Call the onCustomerSelect callback if provided
      if (onCustomerSelect) {
        onCustomerSelect(customerId);
      }
      
      // Set client ID if available
      if (setClientId) {
        setClientId(customerId);
      }
    }
  };

  const customerOptions = customersToUse.map((customer) => ({
    label: `${customer.first_name} ${customer.last_name} (${customer.email || "No email"})`,
    value: customer.id,
  }));

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="customer-search">Search Customers</Label>
        <div className="relative">
          <Combobox
            items={customerOptions}
            placeholder="Search customers..."
            isLoading={isLoading}
            onItemSelected={handleCustomerSelect}
            onInputChange={setSearchTerm}
          />
        </div>
      </div>

      <Separator className="my-4" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customer_first_name">First Name</Label>
          <Input
            id="customer_first_name"
            placeholder="First name"
            value={customerFirstName}
            onChange={(e) => setCustomerFirstName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer_last_name">Last Name</Label>
          <Input
            id="customer_last_name"
            placeholder="Last name"
            value={customerLastName}
            onChange={(e) => setCustomerLastName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer_email">Email</Label>
          <Input
            id="customer_email"
            type="email"
            placeholder="Email address"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer_phone">Phone</Label>
          <Input
            id="customer_phone"
            placeholder="Phone number"
            value={customerPhone || ""}
            onChange={(e) => setCustomerPhone && setCustomerPhone(e.target.value)}
          />
        </div>
      </div>

      {/* Render different address fields based on what props are provided */}
      {setCustomerAddress ? (
        <div className="space-y-2">
          <Label htmlFor="customer_address">Address</Label>
          <Input
            id="customer_address"
            placeholder="Full address"
            value={customerAddress || ""}
            onChange={(e) => setCustomerAddress(e.target.value)}
          />
        </div>
      ) : (
        <>
          {/* Detailed address fields */}
          {setCustomerStreetAddress && (
            <div className="space-y-2">
              <Label htmlFor="customer_street_address">Street Address</Label>
              <Input
                id="customer_street_address"
                placeholder="Street address"
                value={customerStreetAddress || ""}
                onChange={(e) => setCustomerStreetAddress(e.target.value)}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {setCustomerUnitNumber && (
              <div className="space-y-2">
                <Label htmlFor="customer_unit_number">Unit/Apt Number</Label>
                <Input
                  id="customer_unit_number"
                  placeholder="Unit/Apt number"
                  value={customerUnitNumber || ""}
                  onChange={(e) => setCustomerUnitNumber(e.target.value)}
                />
              </div>
            )}

            {setCustomerCity && (
              <div className="space-y-2">
                <Label htmlFor="customer_city">City</Label>
                <Input
                  id="customer_city"
                  placeholder="City"
                  value={customerCity || ""}
                  onChange={(e) => setCustomerCity(e.target.value)}
                />
              </div>
            )}

            {setCustomerStateProvince && (
              <div className="space-y-2">
                <Label htmlFor="customer_state_province">State/Province</Label>
                <Input
                  id="customer_state_province"
                  placeholder="State/Province"
                  value={customerStateProvince || ""}
                  onChange={(e) => setCustomerStateProvince(e.target.value)}
                />
              </div>
            )}

            {setCustomerPostalCode && (
              <div className="space-y-2">
                <Label htmlFor="customer_postal_code">Postal Code</Label>
                <Input
                  id="customer_postal_code"
                  placeholder="Postal Code"
                  value={customerPostalCode || ""}
                  onChange={(e) => setCustomerPostalCode(e.target.value)}
                />
              </div>
            )}

            {setCustomerCountry && (
              <div className="space-y-2">
                <Label htmlFor="customer_country">Country</Label>
                <Input
                  id="customer_country"
                  placeholder="Country"
                  value={customerCountry || ""}
                  onChange={(e) => setCustomerCountry(e.target.value)}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default CustomerInfoFields;
