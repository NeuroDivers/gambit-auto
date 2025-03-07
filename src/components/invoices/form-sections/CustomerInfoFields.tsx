
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerInfoFieldsProps } from "./CustomerInfoFieldsProps";

const CustomerInfoFields = ({ 
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
  customers,
  isLoadingCustomers,
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
  setClientId
}: CustomerInfoFieldsProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="customerFirstName">First Name</Label>
          <Input
            id="customerFirstName"
            placeholder="First name"
            value={customerFirstName}
            onChange={(e) => setCustomerFirstName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="customerLastName">Last Name</Label>
          <Input
            id="customerLastName"
            placeholder="Last name"
            value={customerLastName}
            onChange={(e) => setCustomerLastName(e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="customerEmail">Email</Label>
        <Input
          id="customerEmail"
          type="email"
          placeholder="Email address"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="customerPhone">Phone</Label>
        <Input
          id="customerPhone"
          placeholder="Phone number"
          value={customerPhone || ''}
          onChange={(e) => setCustomerPhone(e.target.value)}
        />
      </div>
      {setCustomerAddress && (
        <div>
          <Label htmlFor="customerAddress">Address</Label>
          <Input
            id="customerAddress"
            placeholder="Complete address"
            value={customerAddress || ''}
            onChange={(e) => setCustomerAddress(e.target.value)}
          />
        </div>
      )}

      {/* Detailed address fields if needed */}
      {setCustomerStreetAddress && (
        <div>
          <Label htmlFor="customerStreetAddress">Street Address</Label>
          <Input
            id="customerStreetAddress"
            placeholder="Street address"
            value={customerStreetAddress || ''}
            onChange={(e) => setCustomerStreetAddress(e.target.value)}
          />
        </div>
      )}
      
      {setCustomerUnitNumber && (
        <div>
          <Label htmlFor="customerUnitNumber">Unit/Apt</Label>
          <Input
            id="customerUnitNumber"
            placeholder="Unit/Apt number"
            value={customerUnitNumber || ''}
            onChange={(e) => setCustomerUnitNumber(e.target.value)}
          />
        </div>
      )}
      
      {setCustomerCity && setCustomerStateProvince && setCustomerPostalCode && (
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="customerCity">City</Label>
            <Input
              id="customerCity"
              placeholder="City"
              value={customerCity || ''}
              onChange={(e) => setCustomerCity(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="customerStateProvince">State/Province</Label>
            <Input
              id="customerStateProvince"
              placeholder="State/Province"
              value={customerStateProvince || ''}
              onChange={(e) => setCustomerStateProvince(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="customerPostalCode">Postal Code</Label>
            <Input
              id="customerPostalCode"
              placeholder="Postal code"
              value={customerPostalCode || ''}
              onChange={(e) => setCustomerPostalCode(e.target.value)}
            />
          </div>
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
          />
        </div>
      )}
    </div>
  );
};

export default CustomerInfoFields;
