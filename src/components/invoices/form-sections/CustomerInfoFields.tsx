
import React from 'react';
import { CustomerInfoFieldsProps } from './CustomerInfoFieldsProps';

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
  // This is a wrapper component to fix the TypeScript issue
  // The actual implementation would be provided in a different file
  // For now, we're just implementing a basic structure to fix type errors
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">First Name</label>
          <input
            type="text"
            value={customerFirstName || ''}
            onChange={(e) => setCustomerFirstName(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Last Name</label>
          <input
            type="text"
            value={customerLastName || ''}
            onChange={(e) => setCustomerLastName(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={customerEmail || ''}
          onChange={(e) => setCustomerEmail(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Phone</label>
        <input
          type="tel"
          value={customerPhone || ''}
          onChange={(e) => setCustomerPhone && setCustomerPhone(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      
      {/* Address fields would go here as needed */}
      {customerStreetAddress !== undefined && setCustomerStreetAddress && (
        <div>
          <label className="block text-sm font-medium mb-1">Street Address</label>
          <input
            type="text"
            value={customerStreetAddress || ''}
            onChange={(e) => setCustomerStreetAddress(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      )}
      
      {/* More fields would be added here to match the full interface */}
      
      {/* Customer selection would be here if needed */}
      {customers && onCustomerSelect && (
        <div>
          <label className="block text-sm font-medium mb-1">Select Existing Customer</label>
          <select 
            onChange={(e) => onCustomerSelect(e.target.value)}
            className="w-full p-2 border rounded"
            disabled={isLoadingCustomers}
          >
            <option value="">Select a customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.customer_first_name} {customer.customer_last_name} ({customer.customer_email})
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
