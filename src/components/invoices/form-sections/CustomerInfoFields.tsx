
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface CustomerInfoFieldsProps {
  customerFirstName: string;
  setCustomerFirstName: (value: string) => void;
  customerLastName: string;
  setCustomerLastName: (value: string) => void;
  customerEmail: string;
  setCustomerEmail: (value: string) => void;
  customerPhone?: string;
  setCustomerPhone: (value: string) => void;
  customerAddress?: string;
  setCustomerAddress?: (value: string) => void;
  customers?: any[];
  isLoadingCustomers?: boolean;
  onCustomerSelect?: (customerId: string) => void;
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
  clientIdField?: string;
  setClientId?: (value: string) => void;
}

export const CustomerInfoFields: React.FC<CustomerInfoFieldsProps> = ({
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
  setCustomerCountry
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customer-first-name">First Name</Label>
          <Input
            id="customer-first-name"
            value={customerFirstName || ''}
            onChange={(e) => setCustomerFirstName(e.target.value)}
            placeholder="First name"
          />
        </div>
        <div>
          <Label htmlFor="customer-last-name">Last Name</Label>
          <Input
            id="customer-last-name"
            value={customerLastName || ''}
            onChange={(e) => setCustomerLastName(e.target.value)}
            placeholder="Last name"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customer-email">Email</Label>
          <Input
            id="customer-email"
            type="email"
            value={customerEmail || ''}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="Email address"
          />
        </div>
        <div>
          <Label htmlFor="customer-phone">Phone</Label>
          <Input
            id="customer-phone"
            value={customerPhone || ''}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="Phone number"
          />
        </div>
      </div>
      
      {setCustomerAddress && (
        <div>
          <Label htmlFor="customer-address">Address</Label>
          <Input
            id="customer-address"
            value={customerAddress || ''}
            onChange={(e) => setCustomerAddress(e.target.value)}
            placeholder="Full address"
          />
        </div>
      )}
      
      {(setCustomerStreetAddress || setCustomerCity) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {setCustomerStreetAddress && (
            <div>
              <Label htmlFor="customer-street-address">Street Address</Label>
              <Input
                id="customer-street-address"
                value={customerStreetAddress || ''}
                onChange={(e) => setCustomerStreetAddress(e.target.value)}
                placeholder="Street address"
              />
            </div>
          )}
          {setCustomerUnitNumber && (
            <div>
              <Label htmlFor="customer-unit-number">Unit/Apt #</Label>
              <Input
                id="customer-unit-number"
                value={customerUnitNumber || ''}
                onChange={(e) => setCustomerUnitNumber(e.target.value)}
                placeholder="Unit/Apt #"
              />
            </div>
          )}
        </div>
      )}
      
      {(setCustomerCity || setCustomerStateProvince || setCustomerPostalCode) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {setCustomerCity && (
            <div>
              <Label htmlFor="customer-city">City</Label>
              <Input
                id="customer-city"
                value={customerCity || ''}
                onChange={(e) => setCustomerCity(e.target.value)}
                placeholder="City"
              />
            </div>
          )}
          {setCustomerStateProvince && (
            <div>
              <Label htmlFor="customer-state-province">State/Province</Label>
              <Input
                id="customer-state-province"
                value={customerStateProvince || ''}
                onChange={(e) => setCustomerStateProvince(e.target.value)}
                placeholder="State/Province"
              />
            </div>
          )}
          {setCustomerPostalCode && (
            <div>
              <Label htmlFor="customer-postal-code">Postal Code</Label>
              <Input
                id="customer-postal-code"
                value={customerPostalCode || ''}
                onChange={(e) => setCustomerPostalCode(e.target.value)}
                placeholder="Postal Code"
              />
            </div>
          )}
        </div>
      )}
      
      {setCustomerCountry && (
        <div>
          <Label htmlFor="customer-country">Country</Label>
          <Input
            id="customer-country"
            value={customerCountry || ''}
            onChange={(e) => setCustomerCountry(e.target.value)}
            placeholder="Country"
          />
        </div>
      )}
    </div>
  );
};

export default CustomerInfoFields;
