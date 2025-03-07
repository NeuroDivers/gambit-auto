
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface VehicleInfoFieldsProps {
  make: string;
  setMake: (value: string) => void;
  model: string;
  setModel: (value: string) => void;
  year: number | string;
  setYear: (value: string | number) => void;
  vin: string;
  setVin: (value: string) => void;
  color?: string;
  setColor?: (value: string) => void;
  trim?: string;
  setTrim?: (value: string) => void;
  bodyClass?: string;
  setBodyClass?: (value: string) => void;
  doors?: number;
  setDoors?: (value: number) => void;
  licensePlate?: string;
  setLicensePlate?: (value: string) => void;
  mileage?: number;
  setMileage?: (value: number) => void;
  readOnly?: boolean;
  customerId?: string | null;
  
  // Additional props for compatibility with older components
  vehicleMake?: string;
  setVehicleMake?: (value: string) => void;
  vehicleModel?: string;
  setVehicleModel?: (value: string) => void;
  vehicleYear?: number | string;
  setVehicleYear?: (value: string | number) => void;
  vehicleVin?: string;
  setVehicleVin?: (value: string) => void;
  vehicleColor?: string;
  setVehicleColor?: (value: string) => void;
  vehicleTrim?: string;
  setVehicleTrim?: (value: string) => void;
  vehicleBodyClass?: string;
  setVehicleBodyClass?: (value: string) => void;
  vehicleDoors?: number;
  setVehicleDoors?: (value: number) => void;
  vehicleLicensePlate?: string;
  setVehicleLicensePlate?: (value: string) => void;
}

export const VehicleInfoFields: React.FC<VehicleInfoFieldsProps> = ({
  make,
  setMake,
  model,
  setModel,
  year,
  setYear,
  vin,
  setVin,
  color,
  setColor,
  trim,
  setTrim,
  bodyClass,
  setBodyClass,
  doors,
  setDoors,
  licensePlate,
  setLicensePlate,
  mileage,
  setMileage,
  readOnly = false,
  customerId,
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
  vehicleTrim,
  setVehicleTrim,
  vehicleBodyClass,
  setVehicleBodyClass,
  vehicleDoors,
  setVehicleDoors,
  vehicleLicensePlate,
  setVehicleLicensePlate
}) => {
  // Handle both naming conventions (make/vehicleMake)
  const actualMake = vehicleMake !== undefined ? vehicleMake : make;
  const actualModel = vehicleModel !== undefined ? vehicleModel : model;
  const actualYear = vehicleYear !== undefined ? vehicleYear : year;
  const actualVin = vehicleVin !== undefined ? vehicleVin : vin;
  const actualColor = vehicleColor !== undefined ? vehicleColor : color;
  const actualTrim = vehicleTrim !== undefined ? vehicleTrim : trim;
  const actualBodyClass = vehicleBodyClass !== undefined ? vehicleBodyClass : bodyClass;
  const actualDoors = vehicleDoors !== undefined ? vehicleDoors : doors;
  const actualLicensePlate = vehicleLicensePlate !== undefined ? vehicleLicensePlate : licensePlate;

  const handleMakeChange = (value: string) => {
    if (setVehicleMake) setVehicleMake(value);
    else if (setMake) setMake(value);
  };

  const handleModelChange = (value: string) => {
    if (setVehicleModel) setVehicleModel(value);
    else if (setModel) setModel(value);
  };

  const handleYearChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      if (setVehicleYear) setVehicleYear(numValue);
      else if (setYear) setYear(numValue);
    }
  };

  const handleVinChange = (value: string) => {
    if (setVehicleVin) setVehicleVin(value);
    else if (setVin) setVin(value);
  };

  const handleColorChange = (value: string) => {
    if (setVehicleColor) setVehicleColor(value);
    else if (setColor) setColor(value);
  };

  const handleTrimChange = (value: string) => {
    if (setVehicleTrim) setVehicleTrim(value);
    else if (setTrim) setTrim(value);
  };

  const handleBodyClassChange = (value: string) => {
    if (setVehicleBodyClass) setVehicleBodyClass(value);
    else if (setBodyClass) setBodyClass(value);
  };

  const handleDoorsChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      if (setVehicleDoors) setVehicleDoors(numValue);
      else if (setDoors) setDoors(numValue);
    }
  };

  const handleLicensePlateChange = (value: string) => {
    if (setVehicleLicensePlate) setVehicleLicensePlate(value);
    else if (setLicensePlate) setLicensePlate(value);
  };

  const handleMileageChange = (value: string) => {
    if (setMileage) {
      const numValue = parseInt(value);
      if (!isNaN(numValue)) {
        setMileage(numValue);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="make">Make</Label>
          <Input
            id="make"
            value={actualMake || ""}
            onChange={(e) => handleMakeChange(e.target.value)}
            placeholder="Vehicle make"
            readOnly={readOnly}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Input
            id="model"
            value={actualModel || ""}
            onChange={(e) => handleModelChange(e.target.value)}
            placeholder="Vehicle model"
            readOnly={readOnly}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            value={actualYear || ""}
            onChange={(e) => handleYearChange(e.target.value)}
            placeholder="Vehicle year"
            type="number"
            readOnly={readOnly}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="vin">VIN</Label>
        <Input
          id="vin"
          value={actualVin || ""}
          onChange={(e) => handleVinChange(e.target.value)}
          placeholder="Vehicle identification number"
          readOnly={readOnly}
        />
      </div>

      {(setColor || setVehicleColor || setTrim || setVehicleTrim || setLicensePlate || setVehicleLicensePlate) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(setColor || setVehicleColor) && (
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={actualColor || ""}
                onChange={(e) => handleColorChange(e.target.value)}
                placeholder="Vehicle color"
                readOnly={readOnly}
              />
            </div>
          )}
          {(setTrim || setVehicleTrim) && (
            <div className="space-y-2">
              <Label htmlFor="trim">Trim</Label>
              <Input
                id="trim"
                value={actualTrim || ""}
                onChange={(e) => handleTrimChange(e.target.value)}
                placeholder="Vehicle trim"
                readOnly={readOnly}
              />
            </div>
          )}
          {(setLicensePlate || setVehicleLicensePlate) && (
            <div className="space-y-2">
              <Label htmlFor="licensePlate">License Plate</Label>
              <Input
                id="licensePlate"
                value={actualLicensePlate || ""}
                onChange={(e) => handleLicensePlateChange(e.target.value)}
                placeholder="License plate"
                readOnly={readOnly}
              />
            </div>
          )}
        </div>
      )}

      {(setBodyClass || setVehicleBodyClass || setDoors || setVehicleDoors || setMileage) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(setBodyClass || setVehicleBodyClass) && (
            <div className="space-y-2">
              <Label htmlFor="bodyClass">Body Type</Label>
              <Input
                id="bodyClass"
                value={actualBodyClass || ""}
                onChange={(e) => handleBodyClassChange(e.target.value)}
                placeholder="Body type"
                readOnly={readOnly}
              />
            </div>
          )}
          {(setDoors || setVehicleDoors) && (
            <div className="space-y-2">
              <Label htmlFor="doors">Doors</Label>
              <Input
                id="doors"
                value={actualDoors || ""}
                onChange={(e) => handleDoorsChange(e.target.value)}
                placeholder="Number of doors"
                type="number"
                readOnly={readOnly}
              />
            </div>
          )}
          {setMileage && (
            <div className="space-y-2">
              <Label htmlFor="mileage">Mileage</Label>
              <Input
                id="mileage"
                value={mileage || ""}
                onChange={(e) => handleMileageChange(e.target.value)}
                placeholder="Vehicle mileage"
                type="number"
                readOnly={readOnly}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VehicleInfoFields;
