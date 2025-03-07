
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
      <p className="text-yellow-600 bg-yellow-50 p-2 rounded border border-yellow-200">
        Vehicle information fields temporarily disabled for troubleshooting.
      </p>
    </div>
  );
};

export default VehicleInfoFields;
