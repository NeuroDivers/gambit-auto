
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CustomerInfoFieldsProps } from './CustomerInfoFieldsProps';

export function CustomerInfoFields({
  customerFirstName,
  setCustomerFirstName,
  customerLastName,
  setCustomerLastName,
  customerEmail,
  setCustomerEmail,
  customerPhone = '',
  setCustomerPhone,
  customerAddress = '',
  setCustomerAddress,
  customerStreetAddress = '',
  setCustomerStreetAddress,
  customerUnitNumber = '',
  setCustomerUnitNumber,
  customerCity = '',
  setCustomerCity,
  customerStateProvince = '',
  setCustomerStateProvince,
  customerPostalCode = '',
  setCustomerPostalCode,
  customerCountry = '',
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
        <div className="space-y-2">
          <Label htmlFor="customerFirstName">First Name</Label>
          <Input
            id="customerFirstName"
            value={customerFirstName}
            onChange={(e) => setCustomerFirstName(e.target.value)}
            placeholder="Enter first name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customerLastName">Last Name</Label>
          <Input
            id="customerLastName"
            value={customerLastName}
            onChange={(e) => setCustomerLastName(e.target.value)}
            placeholder="Enter last name"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="customerEmail">Email</Label>
        <Input
          id="customerEmail"
          type="email"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          placeholder="Enter email address"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="customerPhone">Phone Number</Label>
        <Input
          id="customerPhone"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          placeholder="Enter phone number"
        />
      </div>

      {setCustomerAddress && (
        <div className="space-y-2">
          <Label htmlFor="customerAddress">Address</Label>
          <Input
            id="customerAddress"
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
            placeholder="Enter address"
          />
        </div>
      )}

      {setCustomerStreetAddress && (
        <div className="space-y-2">
          <Label htmlFor="customerStreetAddress">Street Address</Label>
          <Input
            id="customerStreetAddress"
            value={customerStreetAddress}
            onChange={(e) => setCustomerStreetAddress(e.target.value)}
            placeholder="Enter street address"
          />
        </div>
      )}

      {setCustomerUnitNumber && (
        <div className="space-y-2">
          <Label htmlFor="customerUnitNumber">Unit/Apt Number</Label>
          <Input
            id="customerUnitNumber"
            value={customerUnitNumber}
            onChange={(e) => setCustomerUnitNumber(e.target.value)}
            placeholder="Enter unit/apt number"
          />
        </div>
      )}

      {setCustomerCity && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customerCity">City</Label>
            <Input
              id="customerCity"
              value={customerCity}
              onChange={(e) => setCustomerCity(e.target.value)}
              placeholder="Enter city"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerStateProvince">State/Province</Label>
            <Input
              id="customerStateProvince"
              value={customerStateProvince}
              onChange={(e) => setCustomerStateProvince(e.target.value)}
              placeholder="Enter state/province"
            />
          </div>
        </div>
      )}

      {setCustomerPostalCode && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customerPostalCode">Postal/Zip Code</Label>
            <Input
              id="customerPostalCode"
              value={customerPostalCode}
              onChange={(e) => setCustomerPostalCode(e.target.value)}
              placeholder="Enter postal/zip code"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerCountry">Country</Label>
            <Input
              id="customerCountry"
              value={customerCountry}
              onChange={(e) => setCustomerCountry(e.target.value)}
              placeholder="Enter country"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Also provide a default export for backwards compatibility
export default CustomerInfoFields;
