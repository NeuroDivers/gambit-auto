
import React from 'react';
import { CustomerInfoFieldsProps } from './CustomerInfoFieldsProps';

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
  setCustomerCountry,
  customers,
  isLoadingCustomers,
  onCustomerSelect,
  setClientId,
}) => {
  // This is a wrapper component that simply passes props to the real implementation
  // Import the actual implementation
  const CustomerInfoFieldsImpl = require('./CustomerInfoFieldsProps').CustomerInfoFields;
  
  return (
    <CustomerInfoFieldsImpl
      customerFirstName={customerFirstName}
      setCustomerFirstName={setCustomerFirstName}
      customerLastName={customerLastName}
      setCustomerLastName={setCustomerLastName}
      customerEmail={customerEmail}
      setCustomerEmail={setCustomerEmail}
      customerPhone={customerPhone}
      setCustomerPhone={setCustomerPhone}
      customerAddress={customerAddress}
      setCustomerAddress={setCustomerAddress}
      customerStreetAddress={customerStreetAddress}
      setCustomerStreetAddress={setCustomerStreetAddress}
      customerUnitNumber={customerUnitNumber}
      setCustomerUnitNumber={setCustomerUnitNumber}
      customerCity={customerCity}
      setCustomerCity={setCustomerCity}
      customerStateProvince={customerStateProvince}
      setCustomerStateProvince={setCustomerStateProvince}
      customerPostalCode={customerPostalCode}
      setCustomerPostalCode={setCustomerPostalCode}
      customerCountry={customerCountry}
      setCustomerCountry={setCustomerCountry}
      customers={customers}
      isLoadingCustomers={isLoadingCustomers}
      onCustomerSelect={onCustomerSelect}
      setClientId={setClientId}
    />
  );
};
