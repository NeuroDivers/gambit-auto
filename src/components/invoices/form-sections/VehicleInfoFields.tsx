
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export interface VehicleInfoFieldsProps {
  make: string;
  setMake: (value: string) => void;
  model: string;
  setModel: (value: string) => void;
  year: number | null;
  setYear: (value: string | number) => void;
  vin: string;
  setVin: (value: string) => void;
  color?: string;
  setColor?: (value: string) => void;
  trim?: string;
  setTrim?: (value: string) => void;
  bodyClass?: string;
  setBodyClass?: (value: string) => void;
  doors?: string;
  setDoors?: (value: string) => void;
  licensePlate?: string;
  setLicensePlate?: (value: string) => void;
  
  // Alternative prop names for compatibility
  vehicleMake?: string;
  setVehicleMake?: (value: string) => void;
  vehicleModel?: string;
  setVehicleModel?: (value: string) => void;
  vehicleYear?: number | null;
  setVehicleYear?: (value: string | number) => void;
  vehicleVin?: string;
  setVehicleVin?: (value: string) => void;
  vehicleColor?: string;
  setVehicleColor?: (value: string) => void;
}

export function VehicleInfoFields({
  // Primary props
  make,
  setMake,
  model,
  setModel,
  year,
  setYear,
  vin,
  setVin,
  color = '',
  setColor,
  trim = '',
  setTrim,
  bodyClass = '',
  setBodyClass,
  doors = '',
  setDoors,
  licensePlate = '',
  setLicensePlate,
  
  // Alternative naming props
  vehicleMake,
  setVehicleMake,
  vehicleModel,
  setVehicleModel,
  vehicleYear,
  setVehicleYear,
  vehicleVin,
  setVehicleVin,
  vehicleColor,
  setVehicleColor,
}: VehicleInfoFieldsProps) {
  // Use alternative props if primary props are not provided
  const actualMake = make || vehicleMake || '';
  const actualModel = model || vehicleModel || '';
  const actualYear = year || vehicleYear || null;
  const actualVin = vin || vehicleVin || '';
  const actualColor = color || vehicleColor || '';
  
  const handleMakeChange = (value: string) => {
    if (setMake) setMake(value);
    if (setVehicleMake) setVehicleMake(value);
  };
  
  const handleModelChange = (value: string) => {
    if (setModel) setModel(value);
    if (setVehicleModel) setVehicleModel(value);
  };
  
  const handleYearChange = (value: string) => {
    if (setYear) setYear(value);
    if (setVehicleYear) setVehicleYear(value);
  };
  
  const handleVinChange = (value: string) => {
    if (setVin) setVin(value);
    if (setVehicleVin) setVehicleVin(value);
  };
  
  const handleColorChange = (value: string) => {
    if (setColor) setColor(value);
    if (setVehicleColor) setVehicleColor(value);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vehicleMake">Make</Label>
          <Input
            id="vehicleMake"
            value={actualMake}
            onChange={(e) => handleMakeChange(e.target.value)}
            placeholder="Enter vehicle make"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vehicleModel">Model</Label>
          <Input
            id="vehicleModel"
            value={actualModel}
            onChange={(e) => handleModelChange(e.target.value)}
            placeholder="Enter vehicle model"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vehicleYear">Year</Label>
          <Input
            id="vehicleYear"
            type="number"
            value={actualYear || ''}
            onChange={(e) => handleYearChange(e.target.value)}
            placeholder="Enter vehicle year"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="vehicleVin">VIN</Label>
        <Input
          id="vehicleVin"
          value={actualVin}
          onChange={(e) => handleVinChange(e.target.value)}
          placeholder="Enter vehicle VIN"
        />
      </div>

      {(setColor || setVehicleColor) && (
        <div className="space-y-2">
          <Label htmlFor="vehicleColor">Color</Label>
          <Input
            id="vehicleColor"
            value={actualColor}
            onChange={(e) => handleColorChange(e.target.value)}
            placeholder="Enter vehicle color"
          />
        </div>
      )}

      {setTrim && (
        <div className="space-y-2">
          <Label htmlFor="vehicleTrim">Trim</Label>
          <Input
            id="vehicleTrim"
            value={trim}
            onChange={(e) => setTrim(e.target.value)}
            placeholder="Enter vehicle trim"
          />
        </div>
      )}

      {setBodyClass && (
        <div className="space-y-2">
          <Label htmlFor="vehicleBodyClass">Body Class</Label>
          <Input
            id="vehicleBodyClass"
            value={bodyClass}
            onChange={(e) => setBodyClass(e.target.value)}
            placeholder="Enter vehicle body class"
          />
        </div>
      )}

      {setDoors && (
        <div className="space-y-2">
          <Label htmlFor="vehicleDoors">Doors</Label>
          <Input
            id="vehicleDoors"
            value={doors}
            onChange={(e) => setDoors(e.target.value)}
            placeholder="Enter number of doors"
          />
        </div>
      )}

      {setLicensePlate && (
        <div className="space-y-2">
          <Label htmlFor="licensePlate">License Plate</Label>
          <Input
            id="licensePlate"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value)}
            placeholder="Enter license plate"
          />
        </div>
      )}
    </div>
  );
}

// Also provide a default export for backwards compatibility
export default VehicleInfoFields;
