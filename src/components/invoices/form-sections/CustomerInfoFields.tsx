
import React from 'react';
import { FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CustomerInfoFieldsProps } from "./CustomerInfoFieldsProps";

// Create component with default export that implements the props interface
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
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>First Name</Label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={customerFirstName}
            onChange={(e) => setCustomerFirstName(e.target.value)}
          />
        </div>
        <div>
          <Label>Last Name</Label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={customerLastName}
            onChange={(e) => setCustomerLastName(e.target.value)}
          />
        </div>
      </div>
      
      <div>
        <Label>Email</Label>
        <input
          type="email"
          className="w-full p-2 border rounded"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
        />
      </div>
      
      <div>
        <Label>Phone</Label>
        <input
          type="tel"
          className="w-full p-2 border rounded"
          value={customerPhone || ''}
          onChange={(e) => setCustomerPhone(e.target.value)}
        />
      </div>
      
      {customerStreetAddress !== undefined && setCustomerStreetAddress && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Unit/Apt #</Label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={customerUnitNumber || ''}
              onChange={(e) => setCustomerUnitNumber && setCustomerUnitNumber(e.target.value)}
            />
          </div>
          <div>
            <Label>Street Address</Label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={customerStreetAddress || ''}
              onChange={(e) => setCustomerStreetAddress(e.target.value)}
            />
          </div>
        </div>
      )}
      
      {customerCity !== undefined && setCustomerCity && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>City</Label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={customerCity || ''}
              onChange={(e) => setCustomerCity(e.target.value)}
            />
          </div>
          <div>
            <Label>State/Province</Label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={customerStateProvince || ''}
              onChange={(e) => setCustomerStateProvince && setCustomerStateProvince(e.target.value)}
            />
          </div>
          <div>
            <Label>Postal Code</Label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={customerPostalCode || ''}
              onChange={(e) => setCustomerPostalCode && setCustomerPostalCode(e.target.value)}
            />
          </div>
        </div>
      )}
      
      {customerCountry !== undefined && setCustomerCountry && (
        <div>
          <Label>Country</Label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={customerCountry || ''}
            onChange={(e) => setCustomerCountry(e.target.value)}
          />
        </div>
      )}
      
      {customerAddress !== undefined && setCustomerAddress && (
        <div>
          <Label>Full Address</Label>
          <Textarea
            className="w-full p-2 border rounded"
            value={customerAddress || ''}
            onChange={(e) => setCustomerAddress(e.target.value)}
          />
        </div>
      )}
    </div>
  );
};

// Export both the component as default and the type for flexibility
export type { CustomerInfoFieldsProps };
export default CustomerInfoFields;
