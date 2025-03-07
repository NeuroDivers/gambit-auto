
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
}) => {
  const handleYearChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      setYear(numValue);
    } else {
      setYear("");
    }
  };

  const handleDoorsChange = (value: string) => {
    if (setDoors) {
      const numValue = parseInt(value);
      if (!isNaN(numValue)) {
        setDoors(numValue);
      }
    }
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
            value={make}
            onChange={(e) => setMake(e.target.value)}
            placeholder="Vehicle make"
            readOnly={readOnly}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Input
            id="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="Vehicle model"
            readOnly={readOnly}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            value={year}
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
          value={vin}
          onChange={(e) => setVin(e.target.value)}
          placeholder="Vehicle identification number"
          readOnly={readOnly}
        />
      </div>

      {(setColor || setTrim || setLicensePlate) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {setColor && (
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={color || ""}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Vehicle color"
                readOnly={readOnly}
              />
            </div>
          )}
          {setTrim && (
            <div className="space-y-2">
              <Label htmlFor="trim">Trim</Label>
              <Input
                id="trim"
                value={trim || ""}
                onChange={(e) => setTrim(e.target.value)}
                placeholder="Vehicle trim"
                readOnly={readOnly}
              />
            </div>
          )}
          {setLicensePlate && (
            <div className="space-y-2">
              <Label htmlFor="licensePlate">License Plate</Label>
              <Input
                id="licensePlate"
                value={licensePlate || ""}
                onChange={(e) => setLicensePlate(e.target.value)}
                placeholder="License plate"
                readOnly={readOnly}
              />
            </div>
          )}
        </div>
      )}

      {(setBodyClass || setDoors || setMileage) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {setBodyClass && (
            <div className="space-y-2">
              <Label htmlFor="bodyClass">Body Type</Label>
              <Input
                id="bodyClass"
                value={bodyClass || ""}
                onChange={(e) => setBodyClass(e.target.value)}
                placeholder="Body type"
                readOnly={readOnly}
              />
            </div>
          )}
          {setDoors && (
            <div className="space-y-2">
              <Label htmlFor="doors">Doors</Label>
              <Input
                id="doors"
                value={doors || ""}
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
