
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
  setCustomerCountry
}: CustomerInfoFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="customer_first_name" className="text-sm font-medium">First Name</label>
          <Input
            id="customer_first_name"
            value={customerFirstName}
            onChange={(e) => setCustomerFirstName(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="customer_last_name" className="text-sm font-medium">Last Name</label>
          <Input
            id="customer_last_name"
            value={customerLastName}
            onChange={(e) => setCustomerLastName(e.target.value)}
            className="w-full"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="customer_email" className="text-sm font-medium">Email</label>
          <Input
            id="customer_email"
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            className="w-full"
          />
        </div>
        
        {setCustomerPhone && (
          <div className="space-y-2">
            <label htmlFor="customer_phone" className="text-sm font-medium">Phone</label>
            <Input
              id="customer_phone"
              value={customerPhone || ''}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full"
            />
          </div>
        )}
      </div>
      
      {setCustomerAddress && (
        <div className="space-y-2">
          <label htmlFor="customer_address" className="text-sm font-medium">Address</label>
          <Input
            id="customer_address"
            value={customerAddress || ''}
            onChange={(e) => setCustomerAddress(e.target.value)}
            className="w-full"
          />
        </div>
      )}
      
      {setCustomerStreetAddress && setCustomerCity && (
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <label htmlFor="customer_street_address" className="text-sm font-medium">Street Address</label>
            <Input
              id="customer_street_address"
              value={customerStreetAddress || ''}
              onChange={(e) => setCustomerStreetAddress(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {setCustomerUnitNumber && (
              <div className="space-y-2">
                <label htmlFor="customer_unit_number" className="text-sm font-medium">Unit/Apt</label>
                <Input
                  id="customer_unit_number"
                  value={customerUnitNumber || ''}
                  onChange={(e) => setCustomerUnitNumber(e.target.value)}
                  className="w-full"
                />
              </div>
            )}
            
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="customer_city" className="text-sm font-medium">City</label>
              <Input
                id="customer_city"
                value={customerCity || ''}
                onChange={(e) => setCustomerCity(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {setCustomerStateProvince && (
              <div className="space-y-2">
                <label htmlFor="customer_state_province" className="text-sm font-medium">State/Province</label>
                <Input
                  id="customer_state_province"
                  value={customerStateProvince || ''}
                  onChange={(e) => setCustomerStateProvince(e.target.value)}
                  className="w-full"
                />
              </div>
            )}
            
            {setCustomerPostalCode && (
              <div className="space-y-2">
                <label htmlFor="customer_postal_code" className="text-sm font-medium">Postal Code</label>
                <Input
                  id="customer_postal_code"
                  value={customerPostalCode || ''}
                  onChange={(e) => setCustomerPostalCode(e.target.value)}
                  className="w-full"
                />
              </div>
            )}
            
            {setCustomerCountry && (
              <div className="space-y-2">
                <label htmlFor="customer_country" className="text-sm font-medium">Country</label>
                <Input
                  id="customer_country"
                  value={customerCountry || ''}
                  onChange={(e) => setCustomerCountry(e.target.value)}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerInfoFields;
