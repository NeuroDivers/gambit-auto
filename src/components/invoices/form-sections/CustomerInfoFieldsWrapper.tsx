
import React from 'react';
import { CustomerInfoFieldsProps } from './CustomerInfoFieldsProps';
import { CustomerInfoFields } from './CustomerInfoFields';

export { CustomerInfoFields };

export default function CustomerInfoFieldsWrapper(props: CustomerInfoFieldsProps) {
  return <CustomerInfoFields {...props} />;
}
