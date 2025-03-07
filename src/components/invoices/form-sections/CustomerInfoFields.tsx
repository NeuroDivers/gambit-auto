
import React from "react";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { CustomerInfoFieldsProps } from "./CustomerInfoFieldsProps";

export const CustomerInfoFields: React.FC<CustomerInfoFieldsProps> = ({
  customerFirstName,
  setCustomerFirstName,
  customerLastName,
  setCustomerLastName,
  customerEmail,
  setCustomerEmail,
  customerPhone,
  setCustomerPhone,
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
  setClientId,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          name="customer_first_name"
          render={() => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="First Name"
                  value={customerFirstName}
                  onChange={(e) => setCustomerFirstName(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="customer_last_name"
          render={() => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Last Name"
                  value={customerLastName}
                  onChange={(e) => setCustomerLastName(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          name="customer_email"
          render={() => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="customer_phone"
          render={() => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input
                  placeholder="Phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Address Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          name="customer_street_address"
          render={() => (
            <FormItem>
              <FormLabel>Street Address</FormLabel>
              <FormControl>
                <Input
                  placeholder="Street Address"
                  value={customerStreetAddress || ""}
                  onChange={(e) => setCustomerStreetAddress(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="customer_unit_number"
          render={() => (
            <FormItem>
              <FormLabel>Unit/Apt Number</FormLabel>
              <FormControl>
                <Input
                  placeholder="Unit/Apt Number"
                  value={customerUnitNumber || ""}
                  onChange={(e) => setCustomerUnitNumber(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          name="customer_city"
          render={() => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input
                  placeholder="City"
                  value={customerCity || ""}
                  onChange={(e) => setCustomerCity(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="customer_state_province"
          render={() => (
            <FormItem>
              <FormLabel>State/Province</FormLabel>
              <FormControl>
                <Input
                  placeholder="State/Province"
                  value={customerStateProvince || ""}
                  onChange={(e) => setCustomerStateProvince(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="customer_postal_code"
          render={() => (
            <FormItem>
              <FormLabel>Postal Code</FormLabel>
              <FormControl>
                <Input
                  placeholder="Postal Code"
                  value={customerPostalCode || ""}
                  onChange={(e) => setCustomerPostalCode(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        name="customer_country"
        render={() => (
          <FormItem>
            <FormLabel>Country</FormLabel>
            <FormControl>
              <Input
                placeholder="Country"
                value={customerCountry || ""}
                onChange={(e) => setCustomerCountry(e.target.value)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default CustomerInfoFields;
