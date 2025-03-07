
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormField, FormItem, FormControl } from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';

export interface VehicleInfoFieldsProps {
  // Form-based props
  disabled?: boolean;
  
  // Direct value props
  make?: string;
  setMake?: (value: string) => void;
  model?: string;
  setModel?: (value: string) => void;
  year?: number | string;
  setYear?: (value: number | string) => void;
  vin?: string;
  setVin?: (value: string) => void;
  color?: string;
  setColor?: (value: string) => void;
  licensePlate?: string;
  setLicensePlate?: (value: string) => void;
  
  // Alternative naming props
  vehicleMake?: string;
  setVehicleMake?: (value: string) => void;
  vehicleModel?: string;
  setVehicleModel?: (value: string) => void;
  vehicleYear?: number | string;
  setVehicleYear?: (value: number | string) => void;
  vehicleVin?: string;
  setVehicleVin?: (value: string) => void;
  vehicleColor?: string;
  setVehicleColor?: (value: string) => void;
  vehicleLicensePlate?: string;
  setVehicleLicensePlate?: (value: string) => void;
}

const VehicleInfoFields: React.FC<VehicleInfoFieldsProps> = ({
  disabled = false,
  
  // Use either naming convention based on what's provided
  make, setMake,
  model, setModel,
  year, setYear,
  vin, setVin,
  color, setColor,
  licensePlate, setLicensePlate,
  
  vehicleMake, setVehicleMake,
  vehicleModel, setVehicleModel,
  vehicleYear, setVehicleYear,
  vehicleVin, setVehicleVin,
  vehicleColor, setVehicleColor,
  vehicleLicensePlate, setVehicleLicensePlate
}) => {
  const formContext = useFormContext();
  const isUsingForm = !!formContext;
  
  // Use whichever prop is provided
  const actualMake = make || vehicleMake || '';
  const actualModel = model || vehicleModel || '';
  const actualYear = year || vehicleYear || '';
  const actualVin = vin || vehicleVin || '';
  const actualColor = color || vehicleColor || '';
  const actualLicensePlate = licensePlate || vehicleLicensePlate || '';
  
  const handleMakeChange = (value: string) => {
    if (setMake) setMake(value);
    if (setVehicleMake) setVehicleMake(value);
  };
  
  const handleModelChange = (value: string) => {
    if (setModel) setModel(value);
    if (setVehicleModel) setVehicleModel(value);
  };
  
  const handleYearChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    if (setYear) setYear(numValue);
    if (setVehicleYear) setVehicleYear(numValue);
  };
  
  const handleVinChange = (value: string) => {
    if (setVin) setVin(value);
    if (setVehicleVin) setVehicleVin(value);
  };
  
  const handleColorChange = (value: string) => {
    if (setColor) setColor(value);
    if (setVehicleColor) setVehicleColor(value);
  };
  
  const handleLicensePlateChange = (value: string) => {
    if (setLicensePlate) setLicensePlate(value);
    if (setVehicleLicensePlate) setVehicleLicensePlate(value);
  };

  if (isUsingForm) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={formContext.control}
            name="customer_vehicle_make"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="customer_vehicle_make">Make</Label>
                <FormControl>
                  <Input
                    id="customer_vehicle_make"
                    placeholder="Vehicle Make"
                    {...field}
                    disabled={disabled}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={formContext.control}
            name="customer_vehicle_model"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="customer_vehicle_model">Model</Label>
                <FormControl>
                  <Input
                    id="customer_vehicle_model"
                    placeholder="Vehicle Model"
                    {...field}
                    disabled={disabled}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={formContext.control}
            name="customer_vehicle_year"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="customer_vehicle_year">Year</Label>
                <FormControl>
                  <Input
                    id="customer_vehicle_year"
                    type="number"
                    placeholder="Vehicle Year"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    disabled={disabled}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={formContext.control}
          name="customer_vehicle_vin"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="customer_vehicle_vin">VIN</Label>
              <FormControl>
                <Input
                  id="customer_vehicle_vin"
                  placeholder="Vehicle VIN"
                  {...field}
                  disabled={disabled}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={formContext.control}
            name="customer_vehicle_color"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="customer_vehicle_color">Color</Label>
                <FormControl>
                  <Input
                    id="customer_vehicle_color"
                    placeholder="Vehicle Color"
                    {...field}
                    disabled={disabled}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={formContext.control}
            name="customer_vehicle_license_plate"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="customer_vehicle_license_plate">License Plate</Label>
                <FormControl>
                  <Input
                    id="customer_vehicle_license_plate"
                    placeholder="License Plate"
                    {...field}
                    disabled={disabled}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>
    );
  }

  // Direct props version
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="vehicle_make">Make</Label>
          <Input
            id="vehicle_make"
            placeholder="Vehicle Make"
            value={actualMake}
            onChange={(e) => handleMakeChange(e.target.value)}
            disabled={disabled}
          />
        </div>

        <div>
          <Label htmlFor="vehicle_model">Model</Label>
          <Input
            id="vehicle_model"
            placeholder="Vehicle Model"
            value={actualModel}
            onChange={(e) => handleModelChange(e.target.value)}
            disabled={disabled}
          />
        </div>

        <div>
          <Label htmlFor="vehicle_year">Year</Label>
          <Input
            id="vehicle_year"
            type="number"
            placeholder="Vehicle Year"
            value={actualYear}
            onChange={(e) => handleYearChange(e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="vehicle_vin">VIN</Label>
        <Input
          id="vehicle_vin"
          placeholder="Vehicle VIN"
          value={actualVin}
          onChange={(e) => handleVinChange(e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="vehicle_color">Color</Label>
          <Input
            id="vehicle_color"
            placeholder="Vehicle Color"
            value={actualColor}
            onChange={(e) => handleColorChange(e.target.value)}
            disabled={disabled}
          />
        </div>

        <div>
          <Label htmlFor="vehicle_license_plate">License Plate</Label>
          <Input
            id="vehicle_license_plate"
            placeholder="License Plate"
            value={actualLicensePlate}
            onChange={(e) => handleLicensePlateChange(e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
};

export default VehicleInfoFields;
