
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';
import { CustomerInfoFieldsProps } from './CustomerInfoFieldsProps';

const CustomerInfoFields: React.FC<CustomerInfoFieldsProps> = ({ 
  disabled = false,
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
  streetAddress,
  setStreetAddress,
  unitNumber,
  setUnitNumber,
  city,
  setCity,
  stateProvince,
  setStateProvince,
  postalCode,
  setPostalCode,
  country,
  setCountry
}) => {
  const formContext = useFormContext();
  const isUsingForm = !!formContext;

  if (isUsingForm) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={formContext.control}
            name="customer_first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="First Name"
                    {...field}
                    disabled={disabled}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={formContext.control}
            name="customer_last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Last Name"
                    {...field}
                    disabled={disabled}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={formContext.control}
          name="customer_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Email"
                  {...field}
                  disabled={disabled}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={formContext.control}
          name="customer_phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input
                  placeholder="Phone"
                  {...field}
                  disabled={disabled}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <FormField
                control={formContext.control}
                name="customer_street_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Street Address"
                        {...field}
                        disabled={disabled}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={formContext.control}
              name="customer_unit_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Unit Number"
                      {...field}
                      disabled={disabled}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={formContext.control}
              name="customer_city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="City"
                      {...field}
                      disabled={disabled}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={formContext.control}
              name="customer_state_province"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State/Province</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="State/Province"
                      {...field}
                      disabled={disabled}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={formContext.control}
              name="customer_postal_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Postal Code"
                      {...field}
                      disabled={disabled}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={formContext.control}
              name="customer_country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Country"
                      {...field}
                      disabled={disabled}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    );
  }
  
  // Direct props version
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            placeholder="First Name"
            value={firstName || ""}
            onChange={(e) => setFirstName && setFirstName(e.target.value)}
            disabled={disabled}
          />
        </div>

        <div>
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            placeholder="Last Name"
            value={lastName || ""}
            onChange={(e) => setLastName && setLastName(e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Email"
          value={email || ""}
          onChange={(e) => setEmail && setEmail(e.target.value)}
          disabled={disabled}
        />
      </div>

      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          placeholder="Phone"
          value={phone || ""}
          onChange={(e) => setPhone && setPhone(e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <Label htmlFor="street_address">Street Address</Label>
            <Input
              id="street_address"
              placeholder="Street Address"
              value={streetAddress || ""}
              onChange={(e) => setStreetAddress && setStreetAddress(e.target.value)}
              disabled={disabled}
            />
          </div>
          
          <div>
            <Label htmlFor="unit_number">Unit Number</Label>
            <Input
              id="unit_number"
              placeholder="Unit Number"
              value={unitNumber || ""}
              onChange={(e) => setUnitNumber && setUnitNumber(e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="City"
              value={city || ""}
              onChange={(e) => setCity && setCity(e.target.value)}
              disabled={disabled}
            />
          </div>
          
          <div>
            <Label htmlFor="state_province">State/Province</Label>
            <Input
              id="state_province"
              placeholder="State/Province"
              value={stateProvince || ""}
              onChange={(e) => setStateProvince && setStateProvince(e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="postal_code">Postal Code</Label>
            <Input
              id="postal_code"
              placeholder="Postal Code"
              value={postalCode || ""}
              onChange={(e) => setPostalCode && setPostalCode(e.target.value)}
              disabled={disabled}
            />
          </div>
          
          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              placeholder="Country"
              value={country || ""}
              onChange={(e) => setCountry && setCountry(e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export { CustomerInfoFields };
export default CustomerInfoFields;
