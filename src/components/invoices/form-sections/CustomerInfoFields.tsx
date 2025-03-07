
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormField, FormItem, FormControl } from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';

export interface CustomerInfoFieldsProps {
  // Form-based props
  disabled?: boolean;
  
  // Direct value props
  customerFirstName?: string;
  setCustomerFirstName?: (value: string) => void;
  customerLastName?: string;
  setCustomerLastName?: (value: string) => void;
  customerEmail?: string;
  setCustomerEmail?: (value: string) => void;
  customerPhone?: string;
  setCustomerPhone?: (value: string) => void;
  customerAddress?: string;
  setCustomerAddress?: (value: string) => void;
}

const CustomerInfoFields: React.FC<CustomerInfoFieldsProps> = ({
  disabled = false,
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
}) => {
  const formContext = useFormContext();
  const isUsingForm = !!formContext;

  if (isUsingForm) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={formContext.control}
            name="customer_first_name"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="customer_first_name">First Name</Label>
                <FormControl>
                  <Input
                    id="customer_first_name"
                    placeholder="First Name"
                    {...field}
                    disabled={disabled}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={formContext.control}
            name="customer_last_name"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="customer_last_name">Last Name</Label>
                <FormControl>
                  <Input
                    id="customer_last_name"
                    placeholder="Last Name"
                    {...field}
                    disabled={disabled}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={formContext.control}
          name="customer_email"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="customer_email">Email</Label>
              <FormControl>
                <Input
                  id="customer_email"
                  type="email"
                  placeholder="Email"
                  {...field}
                  disabled={disabled}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={formContext.control}
          name="customer_phone"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="customer_phone">Phone</Label>
              <FormControl>
                <Input
                  id="customer_phone"
                  placeholder="Phone Number"
                  {...field}
                  disabled={disabled}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={formContext.control}
          name="customer_address"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="customer_address">Address</Label>
              <FormControl>
                <Input
                  id="customer_address"
                  placeholder="Address"
                  {...field}
                  disabled={disabled}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    );
  }

  // Direct props version
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customer_first_name">First Name</Label>
          <Input
            id="customer_first_name"
            placeholder="First Name"
            value={customerFirstName || ''}
            onChange={(e) => setCustomerFirstName?.(e.target.value)}
            disabled={disabled}
          />
        </div>

        <div>
          <Label htmlFor="customer_last_name">Last Name</Label>
          <Input
            id="customer_last_name"
            placeholder="Last Name"
            value={customerLastName || ''}
            onChange={(e) => setCustomerLastName?.(e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="customer_email">Email</Label>
        <Input
          id="customer_email"
          type="email"
          placeholder="Email"
          value={customerEmail || ''}
          onChange={(e) => setCustomerEmail?.(e.target.value)}
          disabled={disabled}
        />
      </div>

      <div>
        <Label htmlFor="customer_phone">Phone</Label>
        <Input
          id="customer_phone"
          placeholder="Phone Number"
          value={customerPhone || ''}
          onChange={(e) => setCustomerPhone?.(e.target.value)}
          disabled={disabled}
        />
      </div>

      <div>
        <Label htmlFor="customer_address">Address</Label>
        <Input
          id="customer_address"
          placeholder="Address"
          value={customerAddress || ''}
          onChange={(e) => setCustomerAddress?.(e.target.value)}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default CustomerInfoFields;
