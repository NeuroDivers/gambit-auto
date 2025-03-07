
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/ui/form";

export interface CustomerInfoFieldsProps {
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  address: string;
  setAddress: (value: string) => void;
  readOnly?: boolean;
}

export const CustomerInfoFields: React.FC<CustomerInfoFieldsProps> = ({
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
  readOnly = false
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="customer-first-name">First Name</Label>
          <Input
            id="customer-first-name"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            readOnly={readOnly}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer-last-name">Last Name</Label>
          <Input
            id="customer-last-name"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            readOnly={readOnly}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="customer-email">Email</Label>
        <Input
          id="customer-email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          readOnly={readOnly}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="customer-phone">Phone</Label>
        <Input
          id="customer-phone"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          readOnly={readOnly}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="customer-address">Address</Label>
        <Input
          id="customer-address"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
};
