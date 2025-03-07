
import React from "react";
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form";

export interface CustomerInfoFieldsProps {
  customerFirstName: string;
  setCustomerFirstName: (value: string) => void;
  customerLastName: string;
  setCustomerLastName: (value: string) => void;
  customerEmail: string;
  setCustomerEmail: (value: string) => void;
  customerPhone?: string;
  setCustomerPhone: (value: string) => void;
  customerAddress?: string;
  setCustomerAddress?: (value: string) => void;
  customers?: any[];
  isLoadingCustomers?: boolean;
  onCustomerSelect?: (customerId: string) => void;
  customerStreetAddress?: string;
  setCustomerStreetAddress?: (value: string) => void;
  customerUnitNumber?: string;
  setCustomerUnitNumber?: (value: string) => void;
  customerCity?: string;
  setCustomerCity?: (value: string) => void;
  customerStateProvince?: string;
  setCustomerStateProvince?: (value: string) => void;
  customerPostalCode?: string;
  setCustomerPostalCode?: (value: string) => void;
  customerCountry?: string;
  setCustomerCountry?: (value: string) => void;
  clientIdField?: string;
  setClientId?: (value: string) => void;
}

function CustomerInfoFields({
  customerFirstName,
  setCustomerFirstName,
  customerLastName,
  setCustomerLastName,
  customerEmail,
  setCustomerEmail,
  customerPhone = "",
  setCustomerPhone,
  customerAddress,
  setCustomerAddress,
  customerStreetAddress,
  setCustomerStreetAddress,
  customerUnitNumber,
  setCustomerUnitNumber,
  customerCity,
  setCustomerCity,
  customerStateProvince,
  setCustomerStateProvince,
  customerPostalCode,
  setCustomerPostalCode,
  customerCountry,
  setCustomerCountry,
}: CustomerInfoFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <FormLabel>First Name</FormLabel>
          <Input
            value={customerFirstName}
            onChange={(e) => setCustomerFirstName(e.target.value)}
            placeholder="First name"
          />
        </div>
        <div className="space-y-2">
          <FormLabel>Last Name</FormLabel>
          <Input
            value={customerLastName}
            onChange={(e) => setCustomerLastName(e.target.value)}
            placeholder="Last name"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <FormLabel>Email</FormLabel>
        <Input
          type="email"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          placeholder="Email address"
        />
      </div>
      
      <div className="space-y-2">
        <FormLabel>Phone</FormLabel>
        <Input
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          placeholder="Phone number"
        />
      </div>
      
      {setCustomerAddress && (
        <div className="space-y-2">
          <FormLabel>Address</FormLabel>
          <Input
            value={customerAddress || ""}
            onChange={(e) => setCustomerAddress(e.target.value)}
            placeholder="Address"
          />
        </div>
      )}
      
      {/* Street Address and Unit Number */}
      {setCustomerStreetAddress && setCustomerUnitNumber && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <FormLabel>Street Address</FormLabel>
            <Input
              value={customerStreetAddress || ""}
              onChange={(e) => setCustomerStreetAddress(e.target.value)}
              placeholder="Street address"
            />
          </div>
          <div className="space-y-2">
            <FormLabel>Unit/Apt #</FormLabel>
            <Input
              value={customerUnitNumber || ""}
              onChange={(e) => setCustomerUnitNumber(e.target.value)}
              placeholder="Unit/Apt #"
            />
          </div>
        </div>
      )}
      
      {/* City, State, Postal Code */}
      {setCustomerCity && setCustomerStateProvince && setCustomerPostalCode && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <FormLabel>City</FormLabel>
            <Input
              value={customerCity || ""}
              onChange={(e) => setCustomerCity(e.target.value)}
              placeholder="City"
            />
          </div>
          <div className="space-y-2">
            <FormLabel>State/Province</FormLabel>
            <Input
              value={customerStateProvince || ""}
              onChange={(e) => setCustomerStateProvince(e.target.value)}
              placeholder="State/Province"
            />
          </div>
          <div className="space-y-2">
            <FormLabel>Postal Code</FormLabel>
            <Input
              value={customerPostalCode || ""}
              onChange={(e) => setCustomerPostalCode(e.target.value)}
              placeholder="Postal code"
            />
          </div>
        </div>
      )}
      
      {/* Country */}
      {setCustomerCountry && (
        <div className="space-y-2">
          <FormLabel>Country</FormLabel>
          <Input
            value={customerCountry || ""}
            onChange={(e) => setCustomerCountry(e.target.value)}
            placeholder="Country"
          />
        </div>
      )}
    </div>
  );
}

export default CustomerInfoFields;
