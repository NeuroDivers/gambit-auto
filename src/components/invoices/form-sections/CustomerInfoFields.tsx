
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerInfoFieldsProps } from './CustomerInfoFieldsProps';

const CustomerInfoFields: React.FC<CustomerInfoFieldsProps> = ({
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
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customer-first-name">First Name</Label>
          <Input
            id="customer-first-name"
            placeholder="Enter first name"
            value={customerFirstName || ""}
            onChange={(e) => setCustomerFirstName(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="customer-last-name">Last Name</Label>
          <Input
            id="customer-last-name"
            placeholder="Enter last name"
            value={customerLastName || ""}
            onChange={(e) => setCustomerLastName(e.target.value)}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customer-email">Email</Label>
          <Input
            id="customer-email"
            type="email"
            placeholder="Enter email address"
            value={customerEmail || ""}
            onChange={(e) => setCustomerEmail(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="customer-phone">Phone</Label>
          <Input
            id="customer-phone"
            placeholder="Enter phone number"
            value={customerPhone || ""}
            onChange={(e) => setCustomerPhone ? setCustomerPhone(e.target.value) : undefined}
          />
        </div>
      </div>
      
      {setCustomerAddress && (
        <div className="space-y-2">
          <Label htmlFor="customer-address">Address</Label>
          <Input
            id="customer-address"
            placeholder="Enter address"
            value={customerAddress || ""}
            onChange={(e) => setCustomerAddress(e.target.value)}
          />
        </div>
      )}
      
      {setCustomerStreetAddress && (
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="customer-street-address">Street Address</Label>
              <Input
                id="customer-street-address"
                placeholder="Street address"
                value={customerStreetAddress || ""}
                onChange={(e) => setCustomerStreetAddress(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customer-unit-number">Unit #</Label>
              <Input
                id="customer-unit-number"
                placeholder="Unit #"
                value={customerUnitNumber || ""}
                onChange={(e) => setCustomerUnitNumber ? setCustomerUnitNumber(e.target.value) : undefined}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer-city">City</Label>
              <Input
                id="customer-city"
                placeholder="City"
                value={customerCity || ""}
                onChange={(e) => setCustomerCity ? setCustomerCity(e.target.value) : undefined}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customer-state-province">State/Province</Label>
              <Input
                id="customer-state-province"
                placeholder="State/Province"
                value={customerStateProvince || ""}
                onChange={(e) => setCustomerStateProvince ? setCustomerStateProvince(e.target.value) : undefined}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer-postal-code">Postal Code</Label>
              <Input
                id="customer-postal-code"
                placeholder="Postal Code"
                value={customerPostalCode || ""}
                onChange={(e) => setCustomerPostalCode ? setCustomerPostalCode(e.target.value) : undefined}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customer-country">Country</Label>
              <Input
                id="customer-country"
                placeholder="Country"
                value={customerCountry || ""}
                onChange={(e) => setCustomerCountry ? setCustomerCountry(e.target.value) : undefined}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerInfoFields;
