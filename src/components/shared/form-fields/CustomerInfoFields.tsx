
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export interface CustomerInfoFieldsProps {
  customerFirstName: string;
  setCustomerFirstName: (value: string) => void;
  customerLastName: string;
  setCustomerLastName: (value: string) => void;
  customerEmail: string;
  setCustomerEmail: (value: string) => void;
  customerPhone: string;
  setCustomerPhone: (value: string) => void;
  readOnly?: boolean;
}

export function CustomerInfoFields({
  customerFirstName,
  setCustomerFirstName,
  customerLastName,
  setCustomerLastName,
  customerEmail,
  setCustomerEmail,
  customerPhone,
  setCustomerPhone,
  readOnly = false
}: CustomerInfoFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FormLabel htmlFor="customer_first_name">First Name</FormLabel>
          <Input
            id="customer_first_name"
            value={customerFirstName}
            onChange={(e) => setCustomerFirstName(e.target.value)}
            placeholder="First Name"
            readOnly={readOnly}
            className={readOnly ? "bg-muted" : ""}
          />
        </div>

        <div>
          <FormLabel htmlFor="customer_last_name">Last Name</FormLabel>
          <Input
            id="customer_last_name"
            value={customerLastName}
            onChange={(e) => setCustomerLastName(e.target.value)}
            placeholder="Last Name"
            readOnly={readOnly}
            className={readOnly ? "bg-muted" : ""}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FormLabel htmlFor="customer_email">Email</FormLabel>
          <Input
            id="customer_email"
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="Email"
            readOnly={readOnly}
            className={readOnly ? "bg-muted" : ""}
          />
        </div>

        <div>
          <FormLabel htmlFor="customer_phone">Phone</FormLabel>
          <Input
            id="customer_phone"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="Phone"
            readOnly={readOnly}
            className={readOnly ? "bg-muted" : ""}
          />
        </div>
      </div>
    </div>
  );
}
