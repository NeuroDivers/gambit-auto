
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SearchIcon } from 'lucide-react';
import { CustomerInfoFieldsProps } from './CustomerInfoFields';

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
  customers = [],
  isLoadingCustomers = false,
  onCustomerSelect,
  clientIdField,
  setClientId,
}: CustomerInfoFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customer_first_name">First Name</Label>
          <Input
            id="customer_first_name"
            value={customerFirstName}
            onChange={(e) => setCustomerFirstName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="customer_last_name">Last Name</Label>
          <Input
            id="customer_last_name"
            value={customerLastName}
            onChange={(e) => setCustomerLastName(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customer_email">Email</Label>
          <Input
            id="customer_email"
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="customer_phone">Phone</Label>
          <Input
            id="customer_phone"
            value={customerPhone || ''}
            onChange={(e) => setCustomerPhone && setCustomerPhone(e.target.value)}
          />
        </div>
      </div>

      {/* Show combined address field if that's what we're using */}
      {setCustomerAddress && (
        <div>
          <Label htmlFor="customer_address">Address</Label>
          <Input
            id="customer_address"
            value={customerAddress || ''}
            onChange={(e) => setCustomerAddress(e.target.value)}
          />
        </div>
      )}

      {/* Show detailed address fields if those are being used */}
      {setCustomerStreetAddress && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer_street_address">Street Address</Label>
              <Input
                id="customer_street_address"
                value={customerStreetAddress || ''}
                onChange={(e) => setCustomerStreetAddress(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="customer_unit_number">Unit Number</Label>
              <Input
                id="customer_unit_number"
                value={customerUnitNumber || ''}
                onChange={(e) => setCustomerUnitNumber && setCustomerUnitNumber(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="customer_city">City</Label>
              <Input
                id="customer_city"
                value={customerCity || ''}
                onChange={(e) => setCustomerCity && setCustomerCity(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="customer_state_province">State/Province</Label>
              <Input
                id="customer_state_province"
                value={customerStateProvince || ''}
                onChange={(e) => setCustomerStateProvince && setCustomerStateProvince(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="customer_postal_code">Postal Code</Label>
              <Input
                id="customer_postal_code"
                value={customerPostalCode || ''}
                onChange={(e) => setCustomerPostalCode && setCustomerPostalCode(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="customer_country">Country</Label>
            <Input
              id="customer_country"
              value={customerCountry || ''}
              onChange={(e) => setCustomerCountry && setCustomerCountry(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Customer search functionality */}
      {onCustomerSelect && customers && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Find existing customer</h3>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <select
                className="w-full rounded-md border border-input bg-background pl-8 pr-2 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                disabled={isLoadingCustomers}
                onChange={(e) => {
                  if (e.target.value && onCustomerSelect) {
                    onCustomerSelect(e.target.value);
                    if (setClientId && clientIdField) {
                      setClientId(e.target.value);
                    }
                  }
                }}
                defaultValue=""
              >
                <option value="" disabled>
                  {isLoadingCustomers ? 'Loading customers...' : 'Select existing customer'}
                </option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.customer_first_name} {customer.customer_last_name} - {customer.customer_email}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
