
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormItem, FormLabel, FormControl } from "@/components/ui/form";

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
  disabled?: boolean;
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
  disabled = false
}: CustomerInfoFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customerFirstName">First Name</Label>
          <Input
            id="customerFirstName"
            placeholder="First Name"
            value={customerFirstName}
            onChange={(e) => setCustomerFirstName(e.target.value)}
            disabled={disabled}
          />
        </div>
        <div>
          <Label htmlFor="customerLastName">Last Name</Label>
          <Input
            id="customerLastName"
            placeholder="Last Name"
            value={customerLastName}
            onChange={(e) => setCustomerLastName(e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="customerEmail">Email</Label>
        <Input
          id="customerEmail"
          type="email"
          placeholder="Email Address"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          disabled={disabled}
        />
      </div>
      
      {setCustomerPhone && (
        <div>
          <Label htmlFor="customerPhone">Phone</Label>
          <Input
            id="customerPhone"
            placeholder="Phone Number"
            value={customerPhone || ''}
            onChange={(e) => setCustomerPhone(e.target.value)}
            disabled={disabled}
          />
        </div>
      )}
      
      {/* Optional simple address field */}
      {setCustomerAddress && (
        <div>
          <Label htmlFor="customerAddress">Address</Label>
          <Input
            id="customerAddress"
            placeholder="Address"
            value={customerAddress || ''}
            onChange={(e) => setCustomerAddress(e.target.value)}
            disabled={disabled}
          />
        </div>
      )}
      
      {/* Detailed address fields */}
      {setCustomerStreetAddress && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="customerStreetAddress">Street Address</Label>
            <Input
              id="customerStreetAddress"
              placeholder="Street Address"
              value={customerStreetAddress || ''}
              onChange={(e) => setCustomerStreetAddress(e.target.value)}
              disabled={disabled}
            />
          </div>
          
          {setCustomerUnitNumber && (
            <div>
              <Label htmlFor="customerUnitNumber">Unit/Apt Number</Label>
              <Input
                id="customerUnitNumber"
                placeholder="Unit/Apt Number"
                value={customerUnitNumber || ''}
                onChange={(e) => setCustomerUnitNumber(e.target.value)}
                disabled={disabled}
              />
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {setCustomerCity && (
              <div>
                <Label htmlFor="customerCity">City</Label>
                <Input
                  id="customerCity"
                  placeholder="City"
                  value={customerCity || ''}
                  onChange={(e) => setCustomerCity(e.target.value)}
                  disabled={disabled}
                />
              </div>
            )}
            
            {setCustomerStateProvince && (
              <div>
                <Label htmlFor="customerStateProvince">State/Province</Label>
                <Input
                  id="customerStateProvince"
                  placeholder="State/Province"
                  value={customerStateProvince || ''}
                  onChange={(e) => setCustomerStateProvince(e.target.value)}
                  disabled={disabled}
                />
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {setCustomerPostalCode && (
              <div>
                <Label htmlFor="customerPostalCode">Postal/Zip Code</Label>
                <Input
                  id="customerPostalCode"
                  placeholder="Postal/Zip Code"
                  value={customerPostalCode || ''}
                  onChange={(e) => setCustomerPostalCode(e.target.value)}
                  disabled={disabled}
                />
              </div>
            )}
            
            {setCustomerCountry && (
              <div>
                <Label htmlFor="customerCountry">Country</Label>
                <Input
                  id="customerCountry"
                  placeholder="Country"
                  value={customerCountry || ''}
                  onChange={(e) => setCustomerCountry(e.target.value)}
                  disabled={disabled}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Add a default export of the component for components that expect it
export default CustomerInfoFields;
