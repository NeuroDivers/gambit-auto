
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CustomerInfoFields } from '@/components/invoices/form-sections/CustomerInfoFields';
import { WorkOrderFormValues } from '../types';

interface CustomerInfoFieldsWrapperProps {
  form: UseFormReturn<WorkOrderFormValues>;
  onCustomerSelect?: (customerId: string) => void;
}

export function CustomerInfoFieldsWrapper({ form, onCustomerSelect }: CustomerInfoFieldsWrapperProps) {
  return (
    <CustomerInfoFields
      customerFirstName={form.watch('customer_first_name')}
      setCustomerFirstName={(value) => form.setValue('customer_first_name', value)}
      customerLastName={form.watch('customer_last_name')}
      setCustomerLastName={(value) => form.setValue('customer_last_name', value)}
      customerEmail={form.watch('customer_email')}
      setCustomerEmail={(value) => form.setValue('customer_email', value)}
      customerPhone={form.watch('customer_phone')}
      setCustomerPhone={(value) => form.setValue('customer_phone', value)}
      customerStreetAddress={form.watch('customer_street_address')}
      setCustomerStreetAddress={(value) => form.setValue('customer_street_address', value)}
      customerUnitNumber={form.watch('customer_unit_number')}
      setCustomerUnitNumber={(value) => form.setValue('customer_unit_number', value)}
      customerCity={form.watch('customer_city')}
      setCustomerCity={(value) => form.setValue('customer_city', value)}
      customerStateProvince={form.watch('customer_state_province')}
      setCustomerStateProvince={(value) => form.setValue('customer_state_province', value)}
      customerPostalCode={form.watch('customer_postal_code')}
      setCustomerPostalCode={(value) => form.setValue('customer_postal_code', value)}
      customerCountry={form.watch('customer_country')}
      setCustomerCountry={(value) => form.setValue('customer_country', value)}
      onCustomerSelect={onCustomerSelect}
      setClientId={(id) => form.setValue('client_id', id)}
    />
  );
}
