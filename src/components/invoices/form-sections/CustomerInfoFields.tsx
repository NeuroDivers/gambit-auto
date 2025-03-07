
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CustomerInfoFieldsProps {
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

export const CustomerInfoFields: React.FC<CustomerInfoFieldsProps> = ({
  customerFirstName,
  setCustomerFirstName,
  customerLastName,
  setCustomerLastName,
  customerEmail,
  setCustomerEmail,
  customerPhone = "",
  setCustomerPhone,
  customerAddress = "",
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
          <Label htmlFor="customerFirstName">First Name</Label>
          <Input
            id="customerFirstName"
            value={customerFirstName}
            onChange={(e) => setCustomerFirstName(e.target.value)}
            placeholder="First name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customerLastName">Last Name</Label>
          <Input
            id="customerLastName"
            value={customerLastName}
            onChange={(e) => setCustomerLastName(e.target.value)}
            placeholder="Last name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customerEmail">Email</Label>
          <Input
            id="customerEmail"
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="Email address"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customerPhone">Phone</Label>
          <Input
            id="customerPhone"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="Phone number"
          />
        </div>
      </div>

      {(setCustomerAddress || setCustomerStreetAddress) && (
        <div className="space-y-2">
          <Label htmlFor="customerAddress">Address</Label>
          {setCustomerAddress ? (
            <Input
              id="customerAddress"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="Customer address"
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {setCustomerStreetAddress && (
                <Input
                  id="customerStreetAddress"
                  value={customerStreetAddress}
                  onChange={(e) => setCustomerStreetAddress(e.target.value)}
                  placeholder="Street address"
                />
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {setCustomerUnitNumber && (
                  <Input
                    id="customerUnitNumber"
                    value={customerUnitNumber}
                    onChange={(e) => setCustomerUnitNumber(e.target.value)}
                    placeholder="Unit/Apt #"
                  />
                )}
                {setCustomerCity && (
                  <Input
                    id="customerCity"
                    value={customerCity}
                    onChange={(e) => setCustomerCity(e.target.value)}
                    placeholder="City"
                  />
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {setCustomerStateProvince && (
                  <Input
                    id="customerStateProvince"
                    value={customerStateProvince}
                    onChange={(e) => setCustomerStateProvince(e.target.value)}
                    placeholder="State/Province"
                  />
                )}
                {setCustomerPostalCode && (
                  <Input
                    id="customerPostalCode"
                    value={customerPostalCode}
                    onChange={(e) => setCustomerPostalCode(e.target.value)}
                    placeholder="Postal code"
                  />
                )}
              </div>
              {setCustomerCountry && (
                <Input
                  id="customerCountry"
                  value={customerCountry}
                  onChange={(e) => setCustomerCountry(e.target.value)}
                  placeholder="Country"
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerInfoFields;
