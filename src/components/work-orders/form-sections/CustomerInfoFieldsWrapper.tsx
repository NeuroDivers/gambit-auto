import React from 'react';
import CustomerInfoFields from "@/components/invoices/form-sections/CustomerInfoFields";
import { CustomerInfoFieldsProps } from '@/components/invoices/form-sections/CustomerInfoFieldsProps';

export function CustomerInfoFieldsWrapper(props: CustomerInfoFieldsProps) {
  return <CustomerInfoFields {...props} />;
}
