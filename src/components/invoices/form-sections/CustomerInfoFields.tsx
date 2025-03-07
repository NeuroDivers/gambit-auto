
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerInfoFieldsProps } from "./CustomerInfoFieldsProps";

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
  customers = [],
  isLoadingCustomers = false,
  onCustomerSelect,
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
  clientIdField,
  setClientId,
}: CustomerInfoFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="customerFirstName">First Name</Label>
        <Input
          id="customerFirstName"
          value={customerFirstName}
          onChange={(e) => setCustomerFirstName(e.target.value)}
          placeholder="Customer first name"
        />
      </div>
      <div>
        <Label htmlFor="customerLastName">Last Name</Label>
        <Input
          id="customerLastName"
          value={customerLastName}
          onChange={(e) => setCustomerLastName(e.target.value)}
          placeholder="Customer last name"
        />
      </div>
      <div>
        <Label htmlFor="customerEmail">Email</Label>
        <Input
          id="customerEmail"
          type="email"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          placeholder="customer@example.com"
        />
      </div>
      <div>
        <Label htmlFor="customerPhone">Phone</Label>
        <Input
          id="customerPhone"
          value={customerPhone || ''}
          onChange={(e) => setCustomerPhone?.(e.target.value)}
          placeholder="(555) 123-4567"
        />
      </div>
      {customerStreetAddress !== undefined && setCustomerStreetAddress && (
        <div>
          <Label htmlFor="customerStreetAddress">Street Address</Label>
          <Input
            id="customerStreetAddress"
            value={customerStreetAddress || ''}
            onChange={(e) => setCustomerStreetAddress(e.target.value)}
            placeholder="123 Main St"
          />
        </div>
      )}
      {customerUnitNumber !== undefined && setCustomerUnitNumber && (
        <div>
          <Label htmlFor="customerUnitNumber">Unit/Apt Number</Label>
          <Input
            id="customerUnitNumber"
            value={customerUnitNumber || ''}
            onChange={(e) => setCustomerUnitNumber(e.target.value)}
            placeholder="Apt 4B"
          />
        </div>
      )}
      {customerCity !== undefined && setCustomerCity && (
        <div>
          <Label htmlFor="customerCity">City</Label>
          <Input
            id="customerCity"
            value={customerCity || ''}
            onChange={(e) => setCustomerCity(e.target.value)}
            placeholder="Cityville"
          />
        </div>
      )}
      {customerStateProvince !== undefined && setCustomerStateProvince && (
        <div>
          <Label htmlFor="customerStateProvince">State/Province</Label>
          <Input
            id="customerStateProvince"
            value={customerStateProvince || ''}
            onChange={(e) => setCustomerStateProvince(e.target.value)}
            placeholder="State/Province"
          />
        </div>
      )}
      {customerPostalCode !== undefined && setCustomerPostalCode && (
        <div>
          <Label htmlFor="customerPostalCode">Postal/ZIP Code</Label>
          <Input
            id="customerPostalCode"
            value={customerPostalCode || ''}
            onChange={(e) => setCustomerPostalCode(e.target.value)}
            placeholder="12345"
          />
        </div>
      )}
      {customerCountry !== undefined && setCustomerCountry && (
        <div>
          <Label htmlFor="customerCountry">Country</Label>
          <Input
            id="customerCountry"
            value={customerCountry || ''}
            onChange={(e) => setCustomerCountry(e.target.value)}
            placeholder="Country"
          />
        </div>
      )}
      {customerAddress !== undefined && setCustomerAddress && (
        <div className="col-span-full">
          <Label htmlFor="customerAddress">Address</Label>
          <Input
            id="customerAddress"
            value={customerAddress || ''}
            onChange={(e) => setCustomerAddress(e.target.value)}
            placeholder="123 Main St, Cityville, State 12345"
          />
        </div>
      )}
    </div>
  );
}
