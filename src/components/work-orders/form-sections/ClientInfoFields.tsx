
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomerSearch } from './CustomerSearch';
import CustomerInfoFields from '@/components/invoices/form-sections/CustomerInfoFields';

interface ClientInfoFieldsProps {
  form: UseFormReturn<any>;
}

export function ClientInfoFields({ form }: ClientInfoFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Information</CardTitle>
      </CardHeader>
      <CardContent>
        <CustomerSearch form={form} />
        
        <CustomerInfoFields
          customerFirstName={form.watch('customer_first_name')}
          setCustomerFirstName={(value) => form.setValue('customer_first_name', value)}
          customerLastName={form.watch('customer_last_name')}
          setCustomerLastName={(value) => form.setValue('customer_last_name', value)}
          customerEmail={form.watch('customer_email')}
          setCustomerEmail={(value) => form.setValue('customer_email', value)}
          customerPhone={form.watch('customer_phone')}
          setCustomerPhone={(value) => form.setValue('customer_phone', value)}
        />
      </CardContent>
    </Card>
  );
}
