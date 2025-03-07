
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';

export interface CustomerInfoFieldsProps {
  // Form context version
  name?: string;
  control?: any;
  // Direct controlled version
  firstName?: string;
  setFirstName?: (value: string) => void;
  lastName?: string;
  setLastName?: (value: string) => void;
  email?: string;
  setEmail?: (value: string) => void;
  phone?: string;
  setPhone?: (value: string) => void;
  address?: string;
  setAddress?: (value: string) => void;
  // Optional props
  readOnly?: boolean;
  disabled?: boolean;
}

const CustomerInfoFields = ({
  name = '',
  control,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  setEmail,
  phone,
  setPhone,
  address,
  setAddress,
  readOnly = false,
  disabled = false
}: CustomerInfoFieldsProps) => {
  const formContext = useFormContext();
  const useFormApi = !!name && (control || formContext);

  if (useFormApi) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control || formContext?.control}
            name={`${name}.firstName`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="First Name" 
                    readOnly={readOnly}
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control || formContext?.control}
            name={`${name}.lastName`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Last Name" 
                    readOnly={readOnly}
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control || formContext?.control}
            name={`${name}.email`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="email" 
                    placeholder="Email" 
                    readOnly={readOnly}
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control || formContext?.control}
            name={`${name}.phone`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Phone" 
                    readOnly={readOnly}
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control || formContext?.control}
          name={`${name}.address`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Address" 
                  readOnly={readOnly}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    );
  }

  // Direct controlled version
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first-name">First Name</Label>
          <Input
            id="first-name"
            value={firstName || ''}
            onChange={(e) => setFirstName?.(e.target.value)}
            placeholder="First Name"
            readOnly={readOnly}
            disabled={disabled}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="last-name">Last Name</Label>
          <Input
            id="last-name"
            value={lastName || ''}
            onChange={(e) => setLastName?.(e.target.value)}
            placeholder="Last Name"
            readOnly={readOnly}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email || ''}
            onChange={(e) => setEmail?.(e.target.value)}
            placeholder="Email"
            readOnly={readOnly}
            disabled={disabled}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={phone || ''}
            onChange={(e) => setPhone?.(e.target.value)}
            placeholder="Phone"
            readOnly={readOnly}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={address || ''}
          onChange={(e) => setAddress?.(e.target.value)}
          placeholder="Address"
          readOnly={readOnly}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default CustomerInfoFields;
