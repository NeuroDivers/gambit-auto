
import React from 'react';
import { Input } from '@/components/ui/input';
import { FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { FormField } from '@/components/ui/form';
import { CustomerInfoFieldsProps } from './CustomerInfoFieldsProps';
import { SearchableSelect } from '@/components/shared/form-fields/searchable-select/SearchableSelect';

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
  // Handle customer selection from the dropdown
  const handleCustomerSelect = (customer: any) => {
    if (customer && onCustomerSelect) {
      setCustomerFirstName(customer.first_name || '');
      setCustomerLastName(customer.last_name || '');
      setCustomerEmail(customer.email || '');
      
      if (customer.phone) {
        setCustomerPhone(customer.phone);
      }
      
      if (setCustomerAddress && customer.address) {
        setCustomerAddress(customer.address);
      }
      
      if (setCustomerStreetAddress && customer.street_address) {
        setCustomerStreetAddress(customer.street_address);
      }
      
      if (setCustomerUnitNumber && customer.unit_number) {
        setCustomerUnitNumber(customer.unit_number);
      }
      
      if (setCustomerCity && customer.city) {
        setCustomerCity(customer.city);
      }
      
      if (setCustomerStateProvince && customer.state_province) {
        setCustomerStateProvince(customer.state_province);
      }
      
      if (setCustomerPostalCode && customer.postal_code) {
        setCustomerPostalCode(customer.postal_code);
      }
      
      if (setCustomerCountry && customer.country) {
        setCustomerCountry(customer.country);
      }
      
      if (setClientId) {
        setClientId(customer.id);
      }
      
      onCustomerSelect(customer.id);
    }
  };

  return (
    <div className="space-y-4">
      {customers && customers.length > 0 && (
        <div className="mb-6">
          <SearchableSelect
            label="Search Existing Customers"
            options={customers.map((customer) => ({
              label: `${customer.first_name} ${customer.last_name} (${customer.email})`,
              value: customer.id,
              data: customer
            }))}
            onSelect={(option) => handleCustomerSelect(option.data)}
            isLoading={isLoadingCustomers}
            placeholder="Search by name or email"
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="customer_first_name" className="block text-sm font-medium">
            First Name
          </label>
          <Input
            id="customer_first_name"
            value={customerFirstName}
            onChange={(e) => setCustomerFirstName(e.target.value)}
            placeholder="First Name"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="customer_last_name" className="block text-sm font-medium">
            Last Name
          </label>
          <Input
            id="customer_last_name"
            value={customerLastName}
            onChange={(e) => setCustomerLastName(e.target.value)}
            placeholder="Last Name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="customer_email" className="block text-sm font-medium">
            Email
          </label>
          <Input
            id="customer_email"
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="Email"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="customer_phone" className="block text-sm font-medium">
            Phone
          </label>
          <Input
            id="customer_phone"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="Phone"
          />
        </div>
      </div>

      {/* Address Fields - Only render if the setter functions were provided */}
      {setCustomerStreetAddress && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2 space-y-2">
              <label htmlFor="street_address" className="block text-sm font-medium">
                Street Address
              </label>
              <Input
                id="street_address"
                value={customerStreetAddress}
                onChange={(e) => setCustomerStreetAddress(e.target.value)}
                placeholder="Street Address"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="unit_number" className="block text-sm font-medium">
                Unit/Apt #
              </label>
              <Input
                id="unit_number"
                value={customerUnitNumber}
                onChange={(e) => setCustomerUnitNumber(e.target.value)}
                placeholder="Unit/Apt #"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="city" className="block text-sm font-medium">
                City
              </label>
              <Input
                id="city"
                value={customerCity}
                onChange={(e) => setCustomerCity(e.target.value)}
                placeholder="City"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="state_province" className="block text-sm font-medium">
                State/Province
              </label>
              <Input
                id="state_province"
                value={customerStateProvince}
                onChange={(e) => setCustomerStateProvince(e.target.value)}
                placeholder="State/Province"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="postal_code" className="block text-sm font-medium">
                Postal Code
              </label>
              <Input
                id="postal_code"
                value={customerPostalCode}
                onChange={(e) => setCustomerPostalCode(e.target.value)}
                placeholder="Postal Code"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="country" className="block text-sm font-medium">
              Country
            </label>
            <Input
              id="country"
              value={customerCountry}
              onChange={(e) => setCustomerCountry(e.target.value)}
              placeholder="Country"
            />
          </div>
        </div>
      )}

      {/* Legacy address field - Only render if setCustomerAddress was provided but not the more detailed fields */}
      {setCustomerAddress && !setCustomerStreetAddress && (
        <div className="space-y-2">
          <label htmlFor="customer_address" className="block text-sm font-medium">
            Address
          </label>
          <Input
            id="customer_address"
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
            placeholder="Address"
          />
        </div>
      )}
    </div>
  );
}
