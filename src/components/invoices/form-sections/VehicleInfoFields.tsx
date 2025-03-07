
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

const VehicleInfoFields: React.FC<VehicleInfoFieldsProps> = ({
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
        <div>
          <Label htmlFor="vehicleMake">Make</Label>
          <Input
            id="vehicleMake"
            placeholder="Make"
            value={make}
            onChange={(e) => setMake(e.target.value)}
            readOnly={readOnly}
          />
        </div>
        <div>
          <Label htmlFor="vehicleModel">Model</Label>
          <Input
            id="vehicleModel"
            placeholder="Model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            readOnly={readOnly}
          />
        </div>
        <div>
          <Label htmlFor="vehicleYear">Year</Label>
          <Input
            id="vehicleYear"
            placeholder="Year"
            value={year}
            onChange={(e) => handleYearChange(e.target.value)}
            readOnly={readOnly}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="vehicleVin">VIN</Label>
        <Input
          id="vehicleVin"
          placeholder="Vehicle Identification Number"
          value={vin}
          onChange={(e) => setVin(e.target.value)}
          readOnly={readOnly}
        />
      </div>

      {setColor && (
        <div>
          <Label htmlFor="vehicleColor">Color</Label>
          <Input
            id="vehicleColor"
            placeholder="Color"
            value={color || ""}
            onChange={(e) => setColor(e.target.value)}
            readOnly={readOnly}
          />
        </div>
      )}

      {setMileage && (
        <div>
          <Label htmlFor="vehicleMileage">Mileage</Label>
          <Input
            id="vehicleMileage"
            placeholder="Mileage"
            value={mileage || ""}
            onChange={(e) => handleMileageChange(e.target.value)}
            readOnly={readOnly}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {setBodyClass && (
          <div>
            <Label htmlFor="vehicleBodyClass">Body Class</Label>
            <Input
              id="vehicleBodyClass"
              placeholder="Body Class"
              value={bodyClass || ""}
              onChange={(e) => setBodyClass(e.target.value)}
              readOnly={readOnly}
            />
          </div>
        )}

        {setTrim && (
          <div>
            <Label htmlFor="vehicleTrim">Trim</Label>
            <Input
              id="vehicleTrim"
              placeholder="Trim"
              value={trim || ""}
              onChange={(e) => setTrim(e.target.value)}
              readOnly={readOnly}
            />
          </div>
        )}

        {setDoors && (
          <div>
            <Label htmlFor="vehicleDoors">Doors</Label>
            <Input
              id="vehicleDoors"
              placeholder="Number of Doors"
              value={doors || ""}
              onChange={(e) => handleDoorsChange(e.target.value)}
              readOnly={readOnly}
              type="number"
              min="0"
            />
          </div>
        )}
      </div>

      {setLicensePlate && (
        <div>
          <Label htmlFor="vehicleLicensePlate">License Plate</Label>
          <Input
            id="vehicleLicensePlate"
            placeholder="License Plate"
            value={licensePlate || ""}
            onChange={(e) => setLicensePlate(e.target.value)}
            readOnly={readOnly}
          />
        </div>
      )}
    </div>
  );
};

export default VehicleInfoFields;
