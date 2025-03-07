
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';

export interface VehicleInfoFieldsProps {
  // Form context version
  name?: string;
  control?: any;
  // Direct controlled version
  make?: string;
  setMake?: (value: string) => void;
  model?: string;
  setModel?: (value: string) => void;
  year?: string | number;
  setYear?: (value: string | number) => void;
  vin?: string;
  setVin?: (value: string) => void;
  color?: string;
  setColor?: (value: string) => void;
  mileage?: string | number;
  setMileage?: (value: string | number) => void;
  trim?: string;
  setTrim?: (value: string) => void;
  bodyClass?: string;
  setBodyClass?: (value: string) => void;
  licensePlate?: string;
  setLicensePlate?: (value: string) => void;
  // Or alternatively, these naming patterns
  vehicleMake?: string;
  setVehicleMake?: (value: string) => void;
  vehicleModel?: string;
  setVehicleModel?: (value: string) => void;
  vehicleYear?: string | number;
  setVehicleYear?: (value: string | number) => void;
  vehicleVin?: string;
  setVehicleVin?: (value: string) => void;
  vehicleColor?: string;
  setVehicleColor?: (value: string) => void;
  vehicleMileage?: string | number;
  setVehicleMileage?: (value: string | number) => void;
  vehicleTrim?: string;
  setVehicleTrim?: (value: string) => void;
  vehicleBodyClass?: string;
  setVehicleBodyClass?: (value: string) => void;
  vehicleLicensePlate?: string;
  setVehicleLicensePlate?: (value: string) => void;
  // Optional props
  readOnly?: boolean;
  disabled?: boolean;
}

const VehicleInfoFields = ({
  name = '',
  control,
  // Use either naming pattern, preferring the shorter one
  make, setMake, vehicleMake, setVehicleMake,
  model, setModel, vehicleModel, setVehicleModel,
  year, setYear, vehicleYear, setVehicleYear,
  vin, setVin, vehicleVin, setVehicleVin,
  color, setColor, vehicleColor, setVehicleColor,
  mileage, setMileage, vehicleMileage, setVehicleMileage,
  trim, setTrim, vehicleTrim, setVehicleTrim,
  bodyClass, setBodyClass, vehicleBodyClass, setVehicleBodyClass,
  licensePlate, setLicensePlate, vehicleLicensePlate, setVehicleLicensePlate,
  readOnly = false,
  disabled = false
}: VehicleInfoFieldsProps) => {
  const formContext = useFormContext();
  const useFormApi = !!name && (control || formContext);

  // Map values to consistent naming pattern
  const actualMake = make ?? vehicleMake ?? '';
  const actualSetMake = setMake ?? setVehicleMake;
  const actualModel = model ?? vehicleModel ?? '';
  const actualSetModel = setModel ?? setVehicleModel;
  const actualYear = year ?? vehicleYear ?? '';
  const actualSetYear = setYear ?? setVehicleYear;
  const actualVin = vin ?? vehicleVin ?? '';
  const actualSetVin = setVin ?? setVehicleVin;
  const actualColor = color ?? vehicleColor ?? '';
  const actualSetColor = setColor ?? setVehicleColor;
  const actualMileage = mileage ?? vehicleMileage ?? '';
  const actualSetMileage = setMileage ?? setVehicleMileage;
  const actualTrim = trim ?? vehicleTrim ?? '';
  const actualSetTrim = setTrim ?? setVehicleTrim;
  const actualBodyClass = bodyClass ?? vehicleBodyClass ?? '';
  const actualSetBodyClass = setBodyClass ?? setVehicleBodyClass;
  const actualLicensePlate = licensePlate ?? vehicleLicensePlate ?? '';
  const actualSetLicensePlate = setLicensePlate ?? setVehicleLicensePlate;

  if (useFormApi) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={control || formContext?.control}
            name={`${name}.make`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Make</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Make" 
                    readOnly={readOnly}
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control || formContext?.control}
            name={`${name}.model`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Model" 
                    readOnly={readOnly}
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control || formContext?.control}
            name={`${name}.year`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    type="number"
                    placeholder="Year" 
                    readOnly={readOnly}
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control || formContext?.control}
            name={`${name}.vin`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>VIN</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="VIN" 
                    readOnly={readOnly}
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control || formContext?.control}
            name={`${name}.color`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Color" 
                    readOnly={readOnly}
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={control || formContext?.control}
            name={`${name}.mileage`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mileage</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    type="number"
                    placeholder="Mileage" 
                    readOnly={readOnly}
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control || formContext?.control}
            name={`${name}.trim`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trim</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Trim" 
                    readOnly={readOnly}
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control || formContext?.control}
            name={`${name}.licensePlate`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>License Plate</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="License Plate" 
                    readOnly={readOnly}
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    );
  }

  // Direct controlled version
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="make">Make</Label>
          <Input
            id="make"
            value={actualMake}
            onChange={(e) => actualSetMake?.(e.target.value)}
            placeholder="Make"
            readOnly={readOnly}
            disabled={disabled}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Input
            id="model"
            value={actualModel}
            onChange={(e) => actualSetModel?.(e.target.value)}
            placeholder="Model"
            readOnly={readOnly}
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            type="number"
            value={actualYear}
            onChange={(e) => {
              const value = e.target.value;
              actualSetYear?.(value === '' ? '' : Number(value));
            }}
            placeholder="Year"
            readOnly={readOnly}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vin">VIN</Label>
          <Input
            id="vin"
            value={actualVin}
            onChange={(e) => actualSetVin?.(e.target.value)}
            placeholder="VIN"
            readOnly={readOnly}
            disabled={disabled}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            value={actualColor}
            onChange={(e) => actualSetColor?.(e.target.value)}
            placeholder="Color"
            readOnly={readOnly}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="mileage">Mileage</Label>
          <Input
            id="mileage"
            type="number"
            value={actualMileage}
            onChange={(e) => {
              const value = e.target.value;
              actualSetMileage?.(value === '' ? '' : Number(value));
            }}
            placeholder="Mileage"
            readOnly={readOnly}
            disabled={disabled}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="trim">Trim</Label>
          <Input
            id="trim"
            value={actualTrim}
            onChange={(e) => actualSetTrim?.(e.target.value)}
            placeholder="Trim"
            readOnly={readOnly}
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="licensePlate">License Plate</Label>
          <Input
            id="licensePlate"
            value={actualLicensePlate}
            onChange={(e) => actualSetLicensePlate?.(e.target.value)}
            placeholder="License Plate"
            readOnly={readOnly}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
};

export default VehicleInfoFields;
