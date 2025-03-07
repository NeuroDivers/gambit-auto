import { FC } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CustomerInfoFieldsProps } from "./CustomerInfoFields";

export const CustomerInfoFields: FC<CustomerInfoFieldsProps> = ({
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
  customers,
  isLoadingCustomers,
  onCustomerSelect,
  customerStreetAddress = "",
  setCustomerStreetAddress,
  customerUnitNumber = "",
  setCustomerUnitNumber,
  customerCity = "",
  setCustomerCity,
  customerStateProvince = "",
  setCustomerStateProvince,
  customerPostalCode = "",
  setCustomerPostalCode,
  customerCountry = "",
  setCustomerCountry,
  clientIdField,
  setClientId,
}) => {
  // Component implementation
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">First Name</label>
          <Input
            placeholder="First Name"
            value={customerFirstName}
            onChange={(e) => setCustomerFirstName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Last Name</label>
          <Input
            placeholder="Last Name"
            value={customerLastName}
            onChange={(e) => setCustomerLastName(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input
            type="email"
            placeholder="Email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Phone</label>
          <Input
            placeholder="Phone"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
        </div>
      </div>

      {setCustomerStreetAddress && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Street Address</label>
              <Input
                placeholder="Street Address"
                value={customerStreetAddress}
                onChange={(e) => setCustomerStreetAddress(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Unit/Apt Number</label>
              <Input
                placeholder="Unit/Apt Number"
                value={customerUnitNumber}
                onChange={(e) => setCustomerUnitNumber && setCustomerUnitNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">City</label>
              <Input
                placeholder="City"
                value={customerCity}
                onChange={(e) => setCustomerCity && setCustomerCity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">State/Province</label>
              <Input
                placeholder="State/Province"
                value={customerStateProvince}
                onChange={(e) => setCustomerStateProvince && setCustomerStateProvince(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Postal Code</label>
              <Input
                placeholder="Postal Code"
                value={customerPostalCode}
                onChange={(e) => setCustomerPostalCode && setCustomerPostalCode(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Country</label>
            <Input
              placeholder="Country"
              value={customerCountry}
              onChange={(e) => setCustomerCountry && setCustomerCountry(e.target.value)}
            />
          </div>
        </>
      )}

      {setCustomerAddress && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Address</label>
          <Input
            placeholder="Address"
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
          />
        </div>
      )}
    </div>
  );
};

export default CustomerInfoFields;
