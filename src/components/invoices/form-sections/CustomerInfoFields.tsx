
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { CustomerInfoFieldsProps } from './CustomerInfoFields';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Combobox } from '@/components/ui/combobox';
import { debounce } from 'lodash';

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
  const [searchTerm, setSearchTerm] = React.useState('');
  
  // If customers are not provided, fetch them
  const {
    data: fetchedCustomers,
    isLoading: isFetchingCustomers
  } = useQuery({
    queryKey: ['customers', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .or(`customer_first_name.ilike.%${searchTerm}%,customer_last_name.ilike.%${searchTerm}%,customer_email.ilike.%${searchTerm}%`)
        .limit(10);
      
      if (error) {
        console.error('Error fetching customers:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !customers && searchTerm.length >= 2,
  });
  
  const customerOptions = React.useMemo(() => {
    const customersToUse = customers || fetchedCustomers || [];
    return customersToUse.map(customer => ({
      value: customer.id,
      label: `${customer.customer_first_name} ${customer.customer_last_name} (${customer.customer_email || 'No email'})`
    }));
  }, [customers, fetchedCustomers]);
  
  const handleCustomerSelect = React.useCallback((customerId: string) => {
    if (!customerId) return;
    
    const customersToUse = customers || fetchedCustomers || [];
    const selectedCustomer = customersToUse.find(c => c.id === customerId);
    
    if (selectedCustomer) {
      // Update all customer fields
      setCustomerFirstName(selectedCustomer.customer_first_name || '');
      setCustomerLastName(selectedCustomer.customer_last_name || '');
      setCustomerEmail(selectedCustomer.customer_email || '');
      
      if (setCustomerPhone && selectedCustomer.customer_phone) {
        setCustomerPhone(selectedCustomer.customer_phone);
      }
      
      if (setCustomerAddress && selectedCustomer.customer_address) {
        setCustomerAddress(selectedCustomer.customer_address);
      }
      
      // Handle detailed address fields if they exist
      if (setCustomerStreetAddress && selectedCustomer.customer_street_address) {
        setCustomerStreetAddress(selectedCustomer.customer_street_address);
      }
      
      if (setCustomerUnitNumber && selectedCustomer.customer_unit_number) {
        setCustomerUnitNumber(selectedCustomer.customer_unit_number);
      }
      
      if (setCustomerCity && selectedCustomer.customer_city) {
        setCustomerCity(selectedCustomer.customer_city);
      }
      
      if (setCustomerStateProvince && selectedCustomer.customer_state_province) {
        setCustomerStateProvince(selectedCustomer.customer_state_province);
      }
      
      if (setCustomerPostalCode && selectedCustomer.customer_postal_code) {
        setCustomerPostalCode(selectedCustomer.customer_postal_code);
      }
      
      if (setCustomerCountry && selectedCustomer.customer_country) {
        setCustomerCountry(selectedCustomer.customer_country);
      }
      
      // Set client ID if needed
      if (setClientId) {
        setClientId(customerId);
      }
      
      // Call the external onCustomerSelect if provided
      if (onCustomerSelect) {
        onCustomerSelect(customerId);
      }
    }
  }, [
    customers, 
    fetchedCustomers, 
    setCustomerFirstName, 
    setCustomerLastName, 
    setCustomerEmail, 
    setCustomerPhone, 
    setCustomerAddress,
    setCustomerStreetAddress,
    setCustomerUnitNumber,
    setCustomerCity,
    setCustomerStateProvince,
    setCustomerPostalCode,
    setCustomerCountry,
    setClientId,
    onCustomerSelect
  ]);
  
  const handleSearchChange = debounce((value: string) => {
    setSearchTerm(value);
  }, 300);
  
  const isLoading = isLoadingCustomers || isFetchingCustomers;
  
  return (
    <div className="space-y-4">
      {(customerOptions.length > 0 || isLoading) && (
        <div className="mb-4">
          <Label>Search Existing Customers</Label>
          <Combobox
            placeholder="Search by name or email"
            options={customerOptions}
            onValueChange={handleCustomerSelect}
            onInputChange={handleSearchChange}
            isLoading={isLoading}
          />
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customerFirstName">First Name</Label>
          <Input
            id="customerFirstName"
            value={customerFirstName}
            onChange={e => setCustomerFirstName(e.target.value)}
            placeholder="First Name"
          />
        </div>
        
        <div>
          <Label htmlFor="customerLastName">Last Name</Label>
          <Input
            id="customerLastName"
            value={customerLastName}
            onChange={e => setCustomerLastName(e.target.value)}
            placeholder="Last Name"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="customerEmail">Email</Label>
        <Input
          id="customerEmail"
          type="email"
          value={customerEmail}
          onChange={e => setCustomerEmail(e.target.value)}
          placeholder="Email"
        />
      </div>
      
      {setCustomerPhone && (
        <div>
          <Label htmlFor="customerPhone">Phone</Label>
          <Input
            id="customerPhone"
            value={customerPhone || ''}
            onChange={e => setCustomerPhone(e.target.value)}
            placeholder="Phone"
          />
        </div>
      )}
      
      {setCustomerAddress && (
        <div>
          <Label htmlFor="customerAddress">Address</Label>
          <Input
            id="customerAddress"
            value={customerAddress || ''}
            onChange={e => setCustomerAddress(e.target.value)}
            placeholder="Address"
          />
        </div>
      )}
      
      {/* Detailed address fields */}
      {setCustomerStreetAddress && (
        <div>
          <Label htmlFor="customerStreetAddress">Street Address</Label>
          <Input
            id="customerStreetAddress"
            value={customerStreetAddress || ''}
            onChange={e => setCustomerStreetAddress(e.target.value)}
            placeholder="Street Address"
          />
        </div>
      )}
      
      {setCustomerUnitNumber && (
        <div>
          <Label htmlFor="customerUnitNumber">Unit/Apt #</Label>
          <Input
            id="customerUnitNumber"
            value={customerUnitNumber || ''}
            onChange={e => setCustomerUnitNumber(e.target.value)}
            placeholder="Unit/Apt #"
          />
        </div>
      )}
      
      {setCustomerCity && setCustomerStateProvince && setCustomerPostalCode && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="customerCity">City</Label>
            <Input
              id="customerCity"
              value={customerCity || ''}
              onChange={e => setCustomerCity(e.target.value)}
              placeholder="City"
            />
          </div>
          
          <div>
            <Label htmlFor="customerStateProvince">State/Province</Label>
            <Input
              id="customerStateProvince"
              value={customerStateProvince || ''}
              onChange={e => setCustomerStateProvince(e.target.value)}
              placeholder="State/Province"
            />
          </div>
          
          <div>
            <Label htmlFor="customerPostalCode">Postal Code</Label>
            <Input
              id="customerPostalCode"
              value={customerPostalCode || ''}
              onChange={e => setCustomerPostalCode(e.target.value)}
              placeholder="Postal Code"
            />
          </div>
        </div>
      )}
      
      {setCustomerCountry && (
        <div>
          <Label htmlFor="customerCountry">Country</Label>
          <Input
            id="customerCountry"
            value={customerCountry || ''}
            onChange={e => setCustomerCountry(e.target.value)}
            placeholder="Country"
          />
        </div>
      )}
    </div>
  );
}

