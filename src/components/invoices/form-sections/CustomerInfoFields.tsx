
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Search, Star } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type CustomerInfoFieldsProps = {
  customerFirstName: string;
  setCustomerFirstName: (value: string) => void;
  customerLastName: string;
  setCustomerLastName: (value: string) => void;
  customerEmail: string;
  setCustomerEmail: (value: string) => void;
  customerPhone: string;
  setCustomerPhone: (value: string) => void;
  customerAddress?: string;
  setCustomerAddress?: (value: string) => void;
  customerStreetAddress?: string;
  setCustomerStreetAddress?: (value: string) => void;
  customerUnitNumber?: string;
  setCustomerUnitNumber?: (value: string) => void;
  customerCity?: string;
  setCustomerCity?: (value: string) => void;
  customerStateProvince?: string;
  setCustomerStateProvince?: (value: string) => void;
  customerPostalCode?: string;
  setCustomerPostalCode?: (value: string) => void;
  customerCountry?: string;
  setCustomerCountry?: (value: string) => void;
  onCustomerSelect?: (customerId: string) => void;
  clientIdField?: string;
  setClientId?: (value: string) => void;
};

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
  onCustomerSelect,
  clientIdField,
  setClientId
}: CustomerInfoFieldsProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const {
    data: customersList,
    isLoading
  } = useQuery({
    queryKey: ["customers_for_document"],
    queryFn: async () => {
      console.log("Fetching customers for document creation");
      const {
        data,
        error
      } = await supabase.from("customers").select("*").order("customer_last_name", {
        ascending: true
      });
      if (error) {
        console.error("Error fetching customers:", error);
        throw error;
      }
      console.log("Fetched customers:", data);
      return data || [];
    }
  });
  
  const handleCustomerSelect = async (customerId: string) => {
    setSelectedCustomerId(customerId);
    const selectedCustomer = customersList?.find(c => c.id === customerId);
    if (selectedCustomer) {
      console.log("Selected customer:", selectedCustomer);
      setCustomerFirstName(selectedCustomer.customer_first_name || "");
      setCustomerLastName(selectedCustomer.customer_last_name || "");
      setCustomerEmail(selectedCustomer.customer_email || "");
      setCustomerPhone(selectedCustomer.customer_phone || "");

      // Set full address for backward compatibility
      if (setCustomerAddress) {
        const fullAddress = [selectedCustomer.customer_street_address, selectedCustomer.customer_unit_number ? `Unit ${selectedCustomer.customer_unit_number}` : "", selectedCustomer.customer_city, selectedCustomer.customer_state_province, selectedCustomer.customer_postal_code, selectedCustomer.customer_country].filter(Boolean).join(", ");
        setCustomerAddress(fullAddress);
      }

      // Set individual address fields if they exist
      if (setCustomerStreetAddress) setCustomerStreetAddress(selectedCustomer.customer_street_address || "");
      if (setCustomerUnitNumber) setCustomerUnitNumber(selectedCustomer.customer_unit_number || "");
      if (setCustomerCity) setCustomerCity(selectedCustomer.customer_city || "");
      if (setCustomerStateProvince) setCustomerStateProvince(selectedCustomer.customer_state_province || "");
      if (setCustomerPostalCode) setCustomerPostalCode(selectedCustomer.customer_postal_code || "");
      if (setCustomerCountry) setCustomerCountry(selectedCustomer.customer_country || "");

      // Set client_id if needed for forms that use it
      if (setClientId) {
        setClientId(customerId);
      }

      // Fetch customer vehicles when a customer is selected
      try {
        const {
          data: vehicles,
          error
        } = await supabase.from('vehicles').select('*').eq('customer_id', customerId).order('is_primary', {
          ascending: false
        });
        if (error) {
          console.error('Error fetching customer vehicles:', error);
        } else if (vehicles && vehicles.length > 0) {
          // Find primary vehicle or fallback to first vehicle
          const primaryVehicle = vehicles.find(v => v.is_primary) || vehicles[0];
          console.log("Selected vehicle for customer:", primaryVehicle);

          // Dispatch event to inform parent components
          if (onCustomerSelect) onCustomerSelect(customerId);

          // Show success message for vehicle loading
          toast.success(`Vehicle loaded: ${primaryVehicle.year} ${primaryVehicle.make} ${primaryVehicle.model}`);
        }
      } catch (error) {
        console.error('Error in vehicle fetch process:', error);
      }
    }
    setDialogOpen(false);
  };
  
  const filteredCustomers = customersList?.filter(customer => !searchQuery || `${customer.customer_first_name} ${customer.customer_last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) || customer.customer_email?.toLowerCase().includes(searchQuery.toLowerCase()) || customer.customer_phone?.toLowerCase().includes(searchQuery.toLowerCase())) || [];
  
  return <div className="space-y-4">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" className="mb-2 w-full sm:w-auto">
            <Search className="h-4 w-4 mr-2" />
            Select Existing Customer
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {isLoading ? (
              <div className="text-center py-4">Loading customers...</div>
            ) : (
              <div className="grid gap-2">
                {filteredCustomers && filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className="flex justify-between items-center p-3 border rounded-md hover:bg-muted cursor-pointer"
                      onClick={() => handleCustomerSelect(customer.id)}
                    >
                      <div>
                        <p className="font-medium">
                          {customer.customer_first_name} {customer.customer_last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {customer.customer_email}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {customer.customer_phone}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No customers found
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customerFirstName">First Name</Label>
          <Input id="customerFirstName" value={customerFirstName} onChange={e => setCustomerFirstName(e.target.value)} placeholder="Enter first name..." />
        </div>

        <div>
          <Label htmlFor="customerLastName">Last Name</Label>
          <Input id="customerLastName" value={customerLastName} onChange={e => setCustomerLastName(e.target.value)} placeholder="Enter last name..." />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customerEmail">Email</Label>
          <Input id="customerEmail" type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder="Enter email..." />
        </div>

        <div>
          <Label htmlFor="customerPhone">Phone</Label>
          <Input id="customerPhone" type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Enter phone number..." />
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-1">
                <Label htmlFor="customerStreetAddress">Street Address</Label>
                <Input 
                  id="customerStreetAddress" 
                  value={customerStreetAddress || ""} 
                  onChange={e => setCustomerStreetAddress && setCustomerStreetAddress(e.target.value)} 
                  placeholder="Enter street address..." 
                />
              </div>
              <div className="col-span-1">
                <Label htmlFor="customerUnitNumber">Unit Number</Label>
                <Input 
                  id="customerUnitNumber" 
                  value={customerUnitNumber || ""} 
                  onChange={e => setCustomerUnitNumber && setCustomerUnitNumber(e.target.value)} 
                  placeholder="Enter unit number..." 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-1">
                <Label htmlFor="customerCity">City</Label>
                <Input 
                  id="customerCity" 
                  value={customerCity || ""} 
                  onChange={e => setCustomerCity && setCustomerCity(e.target.value)} 
                  placeholder="Enter city..." 
                />
              </div>
              <div className="col-span-1">
                <Label htmlFor="customerStateProvince">State/Province</Label>
                <Input 
                  id="customerStateProvince" 
                  value={customerStateProvince || ""} 
                  onChange={e => setCustomerStateProvince && setCustomerStateProvince(e.target.value)} 
                  placeholder="Enter state/province..." 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-1">
                <Label htmlFor="customerPostalCode">Postal Code</Label>
                <Input 
                  id="customerPostalCode" 
                  value={customerPostalCode || ""} 
                  onChange={e => setCustomerPostalCode && setCustomerPostalCode(e.target.value)} 
                  placeholder="Enter postal code..." 
                />
              </div>
              <div className="col-span-1">
                <Label htmlFor="customerCountry">Country</Label>
                <Input 
                  id="customerCountry" 
                  value={customerCountry || ""} 
                  onChange={e => setCustomerCountry && setCustomerCountry(e.target.value)} 
                  placeholder="Enter country..." 
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {setCustomerStreetAddress === undefined && setCustomerAddress && <div>
          <Label htmlFor="customerAddress">Address</Label>
          <Input id="customerAddress" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} placeholder="Enter address..." />
        </div>}
    </div>;
}
