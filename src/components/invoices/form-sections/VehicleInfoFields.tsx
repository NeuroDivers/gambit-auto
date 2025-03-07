
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface VehicleInfoFieldsProps {
  // Support both naming patterns
  make?: string;
  setMake?: (value: string) => void;
  model?: string;
  setModel?: (value: string) => void;
  year?: number;
  setYear?: (value: number) => void;
  vin?: string;
  setVin?: (value: string) => void;
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
  
  // Support the other naming pattern
  vehicleMake?: string;
  setVehicleMake?: (value: string) => void;
  vehicleModel?: string;
  setVehicleModel?: (value: string) => void;
  vehicleYear?: number;
  setVehicleYear?: (value: number) => void;
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
  
  customerId?: string;
}

export function VehicleInfoFields({
  // Use the first naming pattern by default, but fall back to the second if needed
  make, setMake,
  model, setModel,
  year, setYear,
  vin, setVin,
  color, setColor,
  trim, setTrim,
  bodyClass, setBodyClass,
  doors, setDoors,
  licensePlate, setLicensePlate,
  
  // Second naming pattern
  vehicleMake, setVehicleMake,
  vehicleModel, setVehicleModel,
  vehicleYear, setVehicleYear,
  vehicleVin, setVehicleVin,
  vehicleColor, setVehicleColor,
  vehicleTrim, setVehicleTrim,
  vehicleBodyClass, setVehicleBodyClass,
  vehicleDoors, setVehicleDoors,
  vehicleLicensePlate, setVehicleLicensePlate,
  
  customerId
}: VehicleInfoFieldsProps) {
  
  // Determine which value to use (prefer the first naming convention if available)
  const effectiveMake = make ?? vehicleMake ?? '';
  const effectiveModel = model ?? vehicleModel ?? '';
  const effectiveYear = year ?? vehicleYear ?? new Date().getFullYear();
  const effectiveVin = vin ?? vehicleVin ?? '';
  const effectiveColor = color ?? vehicleColor ?? '';
  const effectiveTrim = trim ?? vehicleTrim ?? '';
  const effectiveBodyClass = bodyClass ?? vehicleBodyClass ?? '';
  const effectiveDoors = doors ?? vehicleDoors ?? 0;
  const effectiveLicensePlate = licensePlate ?? vehicleLicensePlate ?? '';
  
  // Helper functions to handle both naming patterns
  const handleMakeChange = (value: string) => {
    if (setMake) setMake(value);
    else if (setVehicleMake) setVehicleMake(value);
  };
  
  const handleModelChange = (value: string) => {
    if (setModel) setModel(value);
    else if (setVehicleModel) setVehicleModel(value);
  };
  
  const handleYearChange = (value: string) => {
    const numValue = parseInt(value, 10) || new Date().getFullYear();
    if (setYear) setYear(numValue);
    else if (setVehicleYear) setVehicleYear(numValue);
  };
  
  const handleVinChange = (value: string) => {
    if (setVin) setVin(value);
    else if (setVehicleVin) setVehicleVin(value);
  };
  
  const handleColorChange = (value: string) => {
    if (setColor) setColor(value);
    else if (setVehicleColor) setVehicleColor(value);
  };
  
  const handleTrimChange = (value: string) => {
    if (setTrim) setTrim(value);
    else if (setVehicleTrim) setVehicleTrim(value);
  };
  
  const handleBodyClassChange = (value: string) => {
    if (setBodyClass) setBodyClass(value);
    else if (setVehicleBodyClass) setVehicleBodyClass(value);
  };
  
  const handleDoorsChange = (value: string) => {
    const numValue = parseInt(value, 10) || 0;
    if (setDoors) setDoors(numValue);
    else if (setVehicleDoors) setVehicleDoors(numValue);
  };
  
  const handleLicensePlateChange = (value: string) => {
    if (setLicensePlate) setLicensePlate(value);
    else if (setVehicleLicensePlate) setVehicleLicensePlate(value);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vehicle-make">Make</Label>
          <Input
            id="vehicle-make"
            placeholder="e.g. Toyota"
            value={effectiveMake}
            onChange={(e) => handleMakeChange(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="vehicle-model">Model</Label>
          <Input
            id="vehicle-model"
            placeholder="e.g. Camry"
            value={effectiveModel}
            onChange={(e) => handleModelChange(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="vehicle-year">Year</Label>
          <Input
            id="vehicle-year"
            type="number"
            placeholder="e.g. 2023"
            value={effectiveYear}
            onChange={(e) => handleYearChange(e.target.value)}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vehicle-vin">VIN</Label>
          <Input
            id="vehicle-vin"
            placeholder="Vehicle Identification Number"
            value={effectiveVin}
            onChange={(e) => handleVinChange(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="vehicle-license-plate">License Plate</Label>
          <Input
            id="vehicle-license-plate"
            placeholder="License Plate Number"
            value={effectiveLicensePlate}
            onChange={(e) => handleLicensePlateChange(e.target.value)}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vehicle-color">Color</Label>
          <Input
            id="vehicle-color"
            placeholder="e.g. Red"
            value={effectiveColor}
            onChange={(e) => handleColorChange(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="vehicle-trim">Trim</Label>
          <Input
            id="vehicle-trim"
            placeholder="e.g. LE"
            value={effectiveTrim}
            onChange={(e) => handleTrimChange(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="vehicle-doors">Doors</Label>
          <Input
            id="vehicle-doors"
            type="number"
            placeholder="e.g. 4"
            value={effectiveDoors || ''}
            onChange={(e) => handleDoorsChange(e.target.value)}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="vehicle-body-class">Body Class</Label>
        <Input
          id="vehicle-body-class"
          placeholder="e.g. Sedan"
          value={effectiveBodyClass}
          onChange={(e) => handleBodyClassChange(e.target.value)}
        />
      </div>
    </div>
  )
}
