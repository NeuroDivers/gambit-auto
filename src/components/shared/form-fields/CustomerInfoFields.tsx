
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

export interface CustomerInfoFieldsProps {
  form?: UseFormReturn<any>;
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  formPrefix?: string;
  readOnly?: boolean;
}

export const CustomerInfoFields: React.FC<CustomerInfoFieldsProps> = ({
  form,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  setEmail,
  phone,
  setPhone,
  formPrefix = "",
  readOnly = false
}) => {
  // If a form is provided, use FormField components
  if (form) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={`${formPrefix}firstName`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="First Name"
                  {...field}
                  disabled={readOnly}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`${formPrefix}lastName`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Last Name"
                  {...field}
                  disabled={readOnly}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`${formPrefix}email`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Email"
                  {...field}
                  disabled={readOnly}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`${formPrefix}phone`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input
                  placeholder="Phone Number"
                  {...field}
                  disabled={readOnly}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    );
  }

  // If no form is provided, use controlled inputs
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="firstName">
          First Name
        </label>
        <Input
          id="firstName"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          readOnly={readOnly}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="lastName">
          Last Name
        </label>
        <Input
          id="lastName"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          readOnly={readOnly}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="email">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          readOnly={readOnly}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="phone">
          Phone
        </label>
        <Input
          id="phone"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
};
