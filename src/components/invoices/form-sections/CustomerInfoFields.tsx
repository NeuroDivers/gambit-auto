
import React from 'react';
import { CustomerInfoFieldsProps } from './CustomerInfoFieldsProps';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

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
  customers,
  isLoadingCustomers,
  onCustomerSelect,
  clientIdField,
  setClientId
}: CustomerInfoFieldsProps) {
  // Fetch customers from the database if not provided
  const { data: fetchedCustomers, isLoading: isLoadingFetchedCustomers } = useQuery({
    queryKey: ['customers-search'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('customer_first_name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !customers && !isLoadingCustomers
  });

  const displayCustomers = customers || fetchedCustomers || [];
  const isLoading = isLoadingCustomers || isLoadingFetchedCustomers;

  const filteredCustomers = displayCustomers.filter(customer => {
    const searchTerm = `${customerFirstName} ${customerLastName}`.toLowerCase();
    const fullName = `${customer.customer_first_name} ${customer.customer_last_name}`.toLowerCase();
    const emailSearch = customer.customer_email && customerEmail ? 
      customer.customer_email.toLowerCase().includes(customerEmail.toLowerCase()) : false;
      
    return fullName.includes(searchTerm) || emailSearch;
  });

  const handleCustomerSelect = (customer: any) => {
    setCustomerFirstName(customer.customer_first_name || '');
    setCustomerLastName(customer.customer_last_name || '');
    setCustomerEmail(customer.customer_email || '');
    if (setCustomerPhone) setCustomerPhone(customer.customer_phone || '');
    
    // Handle address fields
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
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Customer Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Popover>
            <Label>First Name</Label>
            <div className="flex">
              <Input
                value={customerFirstName}
                onChange={(e) => setCustomerFirstName(e.target.value)}
                placeholder="First Name"
                className="w-full"
              />
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="ml-2">
                  <SearchX className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
            </div>
            <PopoverContent align="end" className="w-80 p-0">
              <Card>
                <CardContent className="p-2">
                  {isLoading ? (
                    <div className="p-4 text-center">Loading customers...</div>
                  ) : filteredCustomers.length === 0 ? (
                    <div className="p-4 text-center">No matching customers found</div>
                  ) : (
                    <div className="max-h-60 overflow-auto">
                      {filteredCustomers.map((customer) => (
                        <div
                          key={customer.id}
                          className="p-2 hover:bg-accent rounded cursor-pointer"
                          onClick={() => handleCustomerSelect(customer)}
                        >
                          <div className="font-medium">
                            {customer.customer_first_name} {customer.customer_last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">{customer.customer_email}</div>
                          {customer.customer_phone && (
                            <div className="text-sm text-muted-foreground">{customer.customer_phone}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </PopoverContent>
          </Popover>
        </div>
        
        <div>
          <Label>Last Name</Label>
          <Input
            value={customerLastName}
            onChange={(e) => setCustomerLastName(e.target.value)}
            placeholder="Last Name"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Email</Label>
          <Input
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="Email"
            type="email"
          />
        </div>
        
        <div>
          <Label>Phone</Label>
          <Input
            value={customerPhone || ''}
            onChange={(e) => setCustomerPhone && setCustomerPhone(e.target.value)}
            placeholder="Phone"
            type="tel"
          />
        </div>
      </div>
      
      {setCustomerStreetAddress && (
        <div className="space-y-4">
          <h4 className="text-md font-medium">Address</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label>Street Address</Label>
              <Input
                value={customerStreetAddress || ''}
                onChange={(e) => setCustomerStreetAddress(e.target.value)}
                placeholder="Street Address"
              />
            </div>
            
            <div>
              <Label>Unit Number</Label>
              <Input
                value={customerUnitNumber || ''}
                onChange={(e) => setCustomerUnitNumber && setCustomerUnitNumber(e.target.value)}
                placeholder="Unit #"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>City</Label>
              <Input
                value={customerCity || ''}
                onChange={(e) => setCustomerCity && setCustomerCity(e.target.value)}
                placeholder="City"
              />
            </div>
            
            <div>
              <Label>State/Province</Label>
              <Input
                value={customerStateProvince || ''}
                onChange={(e) => setCustomerStateProvince && setCustomerStateProvince(e.target.value)}
                placeholder="State/Province"
              />
            </div>
            
            <div>
              <Label>Postal Code</Label>
              <Input
                value={customerPostalCode || ''}
                onChange={(e) => setCustomerPostalCode && setCustomerPostalCode(e.target.value)}
                placeholder="Postal Code"
              />
            </div>
          </div>
          
          <div>
            <Label>Country</Label>
            <Input
              value={customerCountry || ''}
              onChange={(e) => setCustomerCountry && setCustomerCountry(e.target.value)}
              placeholder="Country"
            />
          </div>
        </div>
      )}
      
      {setCustomerAddress && !setCustomerStreetAddress && (
        <div>
          <Label>Address</Label>
          <Input
            value={customerAddress || ''}
            onChange={(e) => setCustomerAddress(e.target.value)}
            placeholder="Address"
          />
        </div>
      )}
    </div>
  );
}
