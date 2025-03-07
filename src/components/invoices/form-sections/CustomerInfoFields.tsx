
import React from 'react';
import { CustomerInfoFieldsProps } from './CustomerInfoFieldsProps';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Combobox } from '@/components/ui/combobox';

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
  setClientId
}: CustomerInfoFieldsProps) {
  const handleCustomerSelect = (customerId: string) => {
    if (onCustomerSelect) {
      onCustomerSelect(customerId);
    }
    
    if (setClientId) {
      setClientId(customerId);
    }
  };

  const showDetailedAddressFields = 
    customerStreetAddress !== undefined || 
    customerUnitNumber !== undefined ||
    customerCity !== undefined ||
    customerStateProvince !== undefined ||
    customerPostalCode !== undefined ||
    customerCountry !== undefined;
  
  return (
    <div className="space-y-4">
      {customers && customers.length > 0 && (
        <div className="mb-4">
          <Label>Search Existing Customers</Label>
          <Combobox
            items={customers.map(c => ({
              label: `${c.first_name} ${c.last_name}`,
              value: c.id
            }))}
            onSelect={handleCustomerSelect}
            placeholder="Search customers..."
            isLoading={isLoadingCustomers}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customer_first_name">First Name</Label>
          <Input
            id="customer_first_name"
            value={customerFirstName || ''}
            onChange={(e) => setCustomerFirstName(e.target.value)}
            placeholder="First name"
          />
        </div>
        <div>
          <Label htmlFor="customer_last_name">Last Name</Label>
          <Input
            id="customer_last_name"
            value={customerLastName || ''}
            onChange={(e) => setCustomerLastName(e.target.value)}
            placeholder="Last name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customer_email">Email</Label>
          <Input
            id="customer_email"
            type="email"
            value={customerEmail || ''}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="Email address"
          />
        </div>
        <div>
          <Label htmlFor="customer_phone">Phone</Label>
          <Input
            id="customer_phone"
            value={customerPhone || ''}
            onChange={(e) => setCustomerPhone ? setCustomerPhone(e.target.value) : null}
            placeholder="Phone number"
          />
        </div>
      </div>

      {!showDetailedAddressFields && setCustomerAddress && (
        <div>
          <Label htmlFor="customer_address">Address</Label>
          <Input
            id="customer_address"
            value={customerAddress || ''}
            onChange={(e) => setCustomerAddress(e.target.value)}
            placeholder="Full address"
          />
        </div>
      )}

      {showDetailedAddressFields && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer_street_address">Street Address</Label>
              <Input
                id="customer_street_address"
                value={customerStreetAddress || ''}
                onChange={(e) => setCustomerStreetAddress ? setCustomerStreetAddress(e.target.value) : null}
                placeholder="Street address"
              />
            </div>
            <div>
              <Label htmlFor="customer_unit_number">Unit/Apt Number</Label>
              <Input
                id="customer_unit_number"
                value={customerUnitNumber || ''}
                onChange={(e) => setCustomerUnitNumber ? setCustomerUnitNumber(e.target.value) : null}
                placeholder="Unit/Apt number"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="customer_city">City</Label>
              <Input
                id="customer_city"
                value={customerCity || ''}
                onChange={(e) => setCustomerCity ? setCustomerCity(e.target.value) : null}
                placeholder="City"
              />
            </div>
            <div>
              <Label htmlFor="customer_state_province">State/Province</Label>
              <Input
                id="customer_state_province"
                value={customerStateProvince || ''}
                onChange={(e) => setCustomerStateProvince ? setCustomerStateProvince(e.target.value) : null}
                placeholder="State/Province"
              />
            </div>
            <div>
              <Label htmlFor="customer_postal_code">Postal Code</Label>
              <Input
                id="customer_postal_code"
                value={customerPostalCode || ''}
                onChange={(e) => setCustomerPostalCode ? setCustomerPostalCode(e.target.value) : null}
                placeholder="Postal code"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="customer_country">Country</Label>
            <Input
              id="customer_country"
              value={customerCountry || ''}
              onChange={(e) => setCustomerCountry ? setCustomerCountry(e.target.value) : null}
              placeholder="Country"
            />
          </div>
        </>
      )}
    </div>
  );
}
