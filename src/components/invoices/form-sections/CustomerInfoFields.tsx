
import React from "react";

export interface CustomerInfoFieldsProps {
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  address?: string;
  setAddress?: (value: string) => void;
  readOnly?: boolean;
  customerId?: string | null;
}

const CustomerInfoFields: React.FC<CustomerInfoFieldsProps> = ({
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
  customerId
}) => {
  return (
    <div className="space-y-4">
      <p className="text-yellow-600 bg-yellow-50 p-2 rounded border border-yellow-200">
        Customer information fields temporarily disabled for troubleshooting.
      </p>
    </div>
  );
};

export default CustomerInfoFields;
