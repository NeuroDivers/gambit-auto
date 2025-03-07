
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormValues } from "../types";
import { CustomerInfoFields } from "@/components/invoices/form-sections/CustomerInfoFields";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { AddressAutocomplete } from "@/components/shared/address/AddressAutocomplete";

interface ClientInfoFieldsProps {
  form: UseFormReturn<WorkOrderFormValues>;
  onCustomerSelect?: (customerId: string) => void;
}

export function ClientInfoFields({
  form,
  onCustomerSelect
}: ClientInfoFieldsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch customers for selection
  const {
    data: customers,
    isLoading
  } = useQuery({
    queryKey: ["customers", searchQuery],
    queryFn: async () => {
      const query = supabase.from("customers").select("*").order("created_at", {
        ascending: false
      });
      if (searchQuery) {
        query.or(`customer_first_name.ilike.%${searchQuery}%,customer_last_name.ilike.%${searchQuery}%,customer_email.ilike.%${searchQuery}%,customer_phone.ilike.%${searchQuery}%`);
      }
      const {
        data,
        error
      } = await query;
      if (error) throw error;
      return data;
    }
  });
  
  const handleSelectCustomer = (customerId: string) => {
    if (onCustomerSelect) {
      onCustomerSelect(customerId);
    }
    setDialogOpen(false);
  };
  
  return <div className="space-y-6">
      {/* Customer selection and address search components in a flex container */}
      <div className="flex flex-col sm:flex-row gap-4 mb-2">
        <div className="w-full sm:w-1/2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" className="w-full">
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
                    {customers && customers.length > 0 ? (
                      customers.map((customer) => (
                        <div
                          key={customer.id}
                          className="flex justify-between items-center p-3 border rounded-md hover:bg-muted cursor-pointer"
                          onClick={() => handleSelectCustomer(customer.id)}
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
        </div>
        
        <div className="w-full sm:w-1/2">
          <AddressAutocomplete 
            form={form} 
            fieldPrefix="customer_" 
          />
        </div>
      </div>
      
      <CustomerInfoFields 
        customerFirstName={form.watch('customer_first_name')} 
        setCustomerFirstName={value => form.setValue('customer_first_name', value)} 
        customerLastName={form.watch('customer_last_name')} 
        setCustomerLastName={value => form.setValue('customer_last_name', value)} 
        customerEmail={form.watch('customer_email')} 
        setCustomerEmail={value => form.setValue('customer_email', value)} 
        customerPhone={form.watch('customer_phone')} 
        setCustomerPhone={value => form.setValue('customer_phone', value)} 
        customerStreetAddress={form.watch('customer_street_address')} 
        setCustomerStreetAddress={value => form.setValue('customer_street_address', value)} 
        customerUnitNumber={form.watch('customer_unit_number')} 
        setCustomerUnitNumber={value => form.setValue('customer_unit_number', value)} 
        customerCity={form.watch('customer_city')} 
        setCustomerCity={value => form.setValue('customer_city', value)} 
        customerStateProvince={form.watch('customer_state_province')} 
        setCustomerStateProvince={value => form.setValue('customer_state_province', value)} 
        customerPostalCode={form.watch('customer_postal_code')} 
        setCustomerPostalCode={value => form.setValue('customer_postal_code', value)} 
        customerCountry={form.watch('customer_country')} 
        setCustomerCountry={value => form.setValue('customer_country', value)} 
        onCustomerSelect={onCustomerSelect} 
        setClientId={value => form.setValue('client_id', value)} 
      />
    </div>;
}
