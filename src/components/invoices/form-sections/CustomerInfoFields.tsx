
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";
import type { CustomerInfoFieldsProps } from "./CustomerInfoFieldsProps";

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
  customers,
  isLoadingCustomers,
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
  clientIdField,
  setClientId,
}: CustomerInfoFieldsProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Search customers when searchTerm changes
  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }

    const searchCustomers = async () => {
      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from("customers")
          .select("*")
          .or(`customer_first_name.ilike.%${searchTerm}%,customer_last_name.ilike.%${searchTerm}%,customer_email.ilike.%${searchTerm}%,customer_phone.ilike.%${searchTerm}%`)
          .limit(10);

        if (error) throw error;
        setSearchResults(data || []);
      } catch (error) {
        console.error("Error searching customers:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    searchCustomers();
  }, [searchTerm]);

  const handleCustomerSelect = (customer: any) => {
    setCustomerFirstName(customer.customer_first_name || "");
    setCustomerLastName(customer.customer_last_name || "");
    setCustomerEmail(customer.customer_email || "");
    setCustomerPhone(customer.customer_phone || "");
    
    // Handle address fields if they exist
    if (setCustomerAddress && customer.customer_address) {
      setCustomerAddress(customer.customer_address);
    }
    
    if (setCustomerStreetAddress && customer.customer_street_address) {
      setCustomerStreetAddress(customer.customer_street_address);
    }
    
    if (setCustomerUnitNumber && customer.customer_unit_number) {
      setCustomerUnitNumber(customer.customer_unit_number);
    }
    
    if (setCustomerCity && customer.customer_city) {
      setCustomerCity(customer.customer_city);
    }
    
    if (setCustomerStateProvince && customer.customer_state_province) {
      setCustomerStateProvince(customer.customer_state_province);
    }
    
    if (setCustomerPostalCode && customer.customer_postal_code) {
      setCustomerPostalCode(customer.customer_postal_code);
    }
    
    if (setCustomerCountry && customer.customer_country) {
      setCustomerCountry(customer.customer_country);
    }
    
    if (setClientId && customer.id) {
      setClientId(customer.id);
    }
    
    if (onCustomerSelect) {
      onCustomerSelect(customer.id);
    }
    
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-4 mb-6">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full" type="button">
              <Search className="mr-2 h-4 w-4" />
              Search Customers
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <Command>
              <CommandInput 
                placeholder="Search by name, email or phone..." 
                value={searchTerm}
                onValueChange={setSearchTerm}
              />
              <CommandList>
                <CommandEmpty>
                  {isSearching ? "Searching..." : "No customers found."}
                </CommandEmpty>
                <CommandGroup>
                  {searchResults.map((customer) => (
                    <CommandItem
                      key={customer.id}
                      value={customer.id}
                      onSelect={() => handleCustomerSelect(customer)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{customer.customer_first_name} {customer.customer_last_name}</span>
                        <span className="text-sm text-muted-foreground">{customer.customer_email}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customerFirstName">First Name</Label>
          <Input
            id="customerFirstName"
            value={customerFirstName}
            onChange={(e) => setCustomerFirstName(e.target.value)}
            placeholder="First Name"
          />
        </div>
        <div>
          <Label htmlFor="customerLastName">Last Name</Label>
          <Input
            id="customerLastName"
            value={customerLastName}
            onChange={(e) => setCustomerLastName(e.target.value)}
            placeholder="Last Name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customerEmail">Email</Label>
          <Input
            id="customerEmail"
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="Email"
          />
        </div>
        <div>
          <Label htmlFor="customerPhone">Phone</Label>
          <Input
            id="customerPhone"
            value={customerPhone || ""}
            onChange={(e) => setCustomerPhone?.(e.target.value)}
            placeholder="Phone Number"
          />
        </div>
      </div>

      {customerAddress !== undefined && setCustomerAddress && (
        <div>
          <Label htmlFor="customerAddress">Address</Label>
          <Input
            id="customerAddress"
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
            placeholder="Address"
          />
        </div>
      )}

      {customerStreetAddress !== undefined && setCustomerStreetAddress && (
        <>
          <div>
            <Label htmlFor="customerStreetAddress">Street Address</Label>
            <Input
              id="customerStreetAddress"
              value={customerStreetAddress}
              onChange={(e) => setCustomerStreetAddress(e.target.value)}
              placeholder="Street Address"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {customerUnitNumber !== undefined && setCustomerUnitNumber && (
              <div>
                <Label htmlFor="customerUnitNumber">Unit/Apt/Suite</Label>
                <Input
                  id="customerUnitNumber"
                  value={customerUnitNumber}
                  onChange={(e) => setCustomerUnitNumber(e.target.value)}
                  placeholder="Unit/Apt/Suite"
                />
              </div>
            )}
            
            {customerCity !== undefined && setCustomerCity && (
              <div>
                <Label htmlFor="customerCity">City</Label>
                <Input
                  id="customerCity"
                  value={customerCity}
                  onChange={(e) => setCustomerCity(e.target.value)}
                  placeholder="City"
                />
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {customerStateProvince !== undefined && setCustomerStateProvince && (
              <div>
                <Label htmlFor="customerStateProvince">State/Province</Label>
                <Input
                  id="customerStateProvince"
                  value={customerStateProvince}
                  onChange={(e) => setCustomerStateProvince(e.target.value)}
                  placeholder="State/Province"
                />
              </div>
            )}
            
            {customerPostalCode !== undefined && setCustomerPostalCode && (
              <div>
                <Label htmlFor="customerPostalCode">Postal/ZIP Code</Label>
                <Input
                  id="customerPostalCode"
                  value={customerPostalCode}
                  onChange={(e) => setCustomerPostalCode(e.target.value)}
                  placeholder="Postal/ZIP Code"
                />
              </div>
            )}
          </div>
          
          {customerCountry !== undefined && setCustomerCountry && (
            <div>
              <Label htmlFor="customerCountry">Country</Label>
              <Input
                id="customerCountry"
                value={customerCountry}
                onChange={(e) => setCustomerCountry(e.target.value)}
                placeholder="Country"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CustomerInfoFields;
