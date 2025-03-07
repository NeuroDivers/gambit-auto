
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface CustomerInfoFieldsProps {
  customerFirstName: string;
  setCustomerFirstName: (value: string) => void;
  customerLastName: string;
  setCustomerLastName: (value: string) => void;
  customerEmail: string;
  setCustomerEmail: (value: string) => void;
  customerPhone?: string;
  setCustomerPhone?: (value: string) => void;
  customerAddress?: string;
  setCustomerAddress?: (value: string) => void;
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
  onCustomerSelect?: (customerId: string) => void;
  clientIdField?: string;
  setClientId?: (value: string) => void;
}

export const CustomerInfoFields: React.FC<CustomerInfoFieldsProps> = ({
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
  onCustomerSelect,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={customerFirstName}
            onChange={(e) => setCustomerFirstName(e.target.value)}
            placeholder="First name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={customerLastName}
            onChange={(e) => setCustomerLastName(e.target.value)}
            placeholder="Last name"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          placeholder="Email address"
          required
        />
      </div>

      {setCustomerPhone && (
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={customerPhone || ""}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="Phone number"
          />
        </div>
      )}

      {setCustomerAddress && (
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={customerAddress || ""}
            onChange={(e) => setCustomerAddress(e.target.value)}
            placeholder="Complete address"
          />
        </div>
      )}

      {/* Detailed address fields */}
      {setCustomerStreetAddress && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="streetAddress">Street Address</Label>
            <Input
              id="streetAddress"
              value={customerStreetAddress || ""}
              onChange={(e) => setCustomerStreetAddress(e.target.value)}
              placeholder="Street address"
            />
          </div>
          {setCustomerUnitNumber && (
            <div className="space-y-2">
              <Label htmlFor="unitNumber">Unit/Apt #</Label>
              <Input
                id="unitNumber"
                value={customerUnitNumber || ""}
                onChange={(e) => setCustomerUnitNumber(e.target.value)}
                placeholder="Unit/Apt #"
              />
            </div>
          )}
        </div>
      )}

      {(setCustomerCity || setCustomerStateProvince || setCustomerPostalCode) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {setCustomerCity && (
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={customerCity || ""}
                onChange={(e) => setCustomerCity(e.target.value)}
                placeholder="City"
              />
            </div>
          )}
          {setCustomerStateProvince && (
            <div className="space-y-2">
              <Label htmlFor="stateProvince">State/Province</Label>
              <Input
                id="stateProvince"
                value={customerStateProvince || ""}
                onChange={(e) => setCustomerStateProvince(e.target.value)}
                placeholder="State/Province"
              />
            </div>
          )}
          {setCustomerPostalCode && (
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={customerPostalCode || ""}
                onChange={(e) => setCustomerPostalCode(e.target.value)}
                placeholder="Postal code"
              />
            </div>
          )}
        </div>
      )}

      {setCustomerCountry && (
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={customerCountry || ""}
            onChange={(e) => setCustomerCountry(e.target.value)}
            placeholder="Country"
          />
        </div>
      )}
    </div>
  );
};

export default CustomerInfoFields;
