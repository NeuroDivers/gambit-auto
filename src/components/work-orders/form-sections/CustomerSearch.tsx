
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CustomerInfoFields } from '@/components/invoices/form-sections/CustomerInfoFields';

export function CustomerSearch({ form }: { form: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Customer search query
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers', searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: searchTerm.length > 1,
  });

  // Function to handle customer selection
  const handleSelectCustomer = (customer: any) => {
    form.setValue('customer_first_name', customer.first_name);
    form.setValue('customer_last_name', customer.last_name);
    form.setValue('customer_email', customer.email);
    form.setValue('customer_phone', customer.phone_number);
    
    // Set client_id if the form has a field for it
    try {
      form.setValue('client_id', customer.id);
    } catch (e) {
      // Field might not exist in the form, ignore error
    }
    
    // Set vehicle information if available
    if (customer.vehicles && customer.vehicles[0]) {
      try {
        form.setValue('vehicle_make', customer.vehicles[0].make);
        form.setValue('vehicle_model', customer.vehicles[0].model);
        form.setValue('vehicle_year', customer.vehicles[0].year);
        form.setValue('vehicle_vin', customer.vehicles[0].vin);
      } catch (e) {
        // Fields might not exist in the form, ignore error
      }
    }
    
    setSelectedCustomerId(customer.id);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" type="button" className="mb-4">
          Search for Customer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Search Customers</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <>
              {customers.length > 0 ? (
                <div className="space-y-4">
                  {customers.map((customer: any) => (
                    <div key={customer.id} className="border p-4 rounded-md hover:bg-gray-50 cursor-pointer" onClick={() => handleSelectCustomer(customer)}>
                      <p className="font-medium">{customer.first_name} {customer.last_name}</p>
                      <p className="text-sm text-gray-500">{customer.email}</p>
                      {customer.phone_number && <p className="text-sm text-gray-500">{customer.phone_number}</p>}
                    </div>
                  ))}
                </div>
              ) : searchTerm.length > 1 ? (
                <p>No customers found. Create a new customer with the form below.</p>
              ) : (
                <p>Type at least 2 characters to search.</p>
              )}
            </>
          )}
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-4">Create New Customer</h3>
            <CustomerInfoFields
              customerFirstName={form.watch('customer_first_name') || ''}
              setCustomerFirstName={(value) => form.setValue('customer_first_name', value)}
              customerLastName={form.watch('customer_last_name') || ''}
              setCustomerLastName={(value) => form.setValue('customer_last_name', value)}
              customerEmail={form.watch('customer_email') || ''}
              setCustomerEmail={(value) => form.setValue('customer_email', value)}
              customerPhone={form.watch('customer_phone') || ''}
              setCustomerPhone={(value) => form.setValue('customer_phone', value)}
            />
            
            <Button
              className="mt-4"
              onClick={() => setIsOpen(false)}
            >
              Use This Customer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
