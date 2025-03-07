
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useVinLookup } from "@/hooks/useVinLookup"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { VinScanner } from "@/components/shared/VinScanner"

type VehicleInfoFieldsProps = {
  make: string;
  setMake: (value: string) => void;
  model: string;
  setModel: (value: string) => void;
  year: number;
  setYear: (value: number) => void;
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
  vehicleMake?: string;
  setVehicleMake?: (value: string) => void;
  vehicleModel?: string;
  setVehicleModel?: (value: string) => void;
  vehicleYear?: number;
  setVehicleYear?: (value: number) => void;
  vehicleVin?: string;
  setVehicleVin?: (value: string) => void;
  vehicleBodyClass?: string;
  setVehicleBodyClass?: (value: string) => void;
  vehicleDoors?: number;
  setVehicleDoors?: (value: number) => void;
  vehicleTrim?: string;
  setVehicleTrim?: (value: string) => void;
  customerId?: string | null;
}

export function VehicleInfoFields({
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
  vehicleMake,
  setVehicleMake,
  vehicleModel,
  setVehicleModel,
  vehicleYear,
  setVehicleYear,
  vehicleVin,
  setVehicleVin,
  vehicleBodyClass,
  setVehicleBodyClass,
  vehicleDoors,
  setVehicleDoors,
  vehicleTrim,
  setVehicleTrim,
  customerId
}: VehicleInfoFieldsProps) {
  // Allow using either 'make' style or 'vehicleMake' style props
  const effectiveMake = vehicleMake ?? make;
  const effectiveSetMake = setVehicleMake ?? setMake;
  
  const effectiveModel = vehicleModel ?? model;
  const effectiveSetModel = setVehicleModel ?? setModel;
  
  const effectiveYear = vehicleYear ?? year;
  const effectiveSetYear = setVehicleYear ?? setYear;
  
  const effectiveVin = vehicleVin ?? vin;
  const effectiveSetVin = setVehicleVin ?? setVin;
  
  const effectiveBodyClass = vehicleBodyClass ?? bodyClass;
  const effectiveSetBodyClass = setVehicleBodyClass ?? setBodyClass;
  
  const effectiveDoors = vehicleDoors ?? doors;
  const effectiveSetDoors = setVehicleDoors ?? setDoors;
  
  const effectiveTrim = vehicleTrim ?? trim;
  const effectiveSetTrim = setVehicleTrim ?? setTrim;

  const { data: vinData, isLoading: isLoadingVin } = useVinLookup(effectiveVin);
  const currentYear = new Date().getFullYear();
  const [open, setOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  useEffect(() => {
    if (vinData && !vinData.error) {
      if (vinData.make) effectiveSetMake(vinData.make);
      if (vinData.model) effectiveSetModel(vinData.model);
      if (vinData.year) effectiveSetYear(vinData.year);
      if (vinData.bodyClass && effectiveSetBodyClass) effectiveSetBodyClass(vinData.bodyClass);
      if (vinData.doors && effectiveSetDoors) effectiveSetDoors(vinData.doors);
      if (vinData.trim && effectiveSetTrim) effectiveSetTrim(vinData.trim);
    }
  }, [vinData, effectiveSetMake, effectiveSetModel, effectiveSetYear, effectiveSetBodyClass, effectiveSetDoors, effectiveSetTrim]);

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const yearValue = parseInt(e.target.value);
    if (!isNaN(yearValue) && yearValue >= 1900 && yearValue <= currentYear + 1) {
      effectiveSetYear(yearValue);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="vehicleVin">
          VIN
          <span className="text-xs text-muted-foreground ml-2">(Auto-fills vehicle info)</span>
        </Label>
        <div className="flex gap-2">
          <Input
            id="vehicleVin"
            value={effectiveVin}
            onChange={(e) => effectiveSetVin(e.target.value)}
            placeholder="Enter VIN for auto-fill"
            autoComplete="off"
          />
          <VinScanner onScan={(vin) => effectiveSetVin(vin)} />
        </div>
      </div>

      <div>
        <Label htmlFor="vehicleYear">Year</Label>
        <div className="relative">
          <Input
            id="vehicleYear"
            type="number"
            min={1900}
            max={currentYear + 1}
            value={effectiveYear || ''}
            onChange={handleYearChange}
            placeholder="Enter vehicle year"
            autoComplete="off"
            disabled={isLoadingVin}
          />
          {isLoadingVin && (
            <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="vehicleMake">Make</Label>
        <div className="relative">
          <Input
            id="vehicleMake"
            value={effectiveMake}
            onChange={(e) => effectiveSetMake(e.target.value)}
            placeholder="Enter vehicle make"
            autoComplete="off"
            disabled={isLoadingVin}
          />
          {isLoadingVin && (
            <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="vehicleModel">Model</Label>
        <div className="relative">
          <Input
            id="vehicleModel"
            value={effectiveModel}
            onChange={(e) => effectiveSetModel(e.target.value)}
            placeholder="Enter vehicle model"
            autoComplete="off"
            disabled={isLoadingVin}
          />
          {isLoadingVin && (
            <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      {effectiveSetBodyClass && (
        <div>
          <Label htmlFor="vehicleBodyClass">Body Class</Label>
          <div className="relative">
            <Input
              id="vehicleBodyClass"
              value={effectiveBodyClass || ''}
              onChange={(e) => effectiveSetBodyClass(e.target.value)}
              placeholder="Enter body class"
              autoComplete="off"
              disabled={isLoadingVin}
            />
            {isLoadingVin && (
              <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>
      )}

      {effectiveSetDoors && (
        <div>
          <Label htmlFor="vehicleDoors">Number of Doors</Label>
          <div className="relative">
            <Input
              id="vehicleDoors"
              type="number"
              min={1}
              value={effectiveDoors || ''}
              onChange={(e) => effectiveSetDoors(parseInt(e.target.value))}
              placeholder="Enter number of doors"
              autoComplete="off"
              disabled={isLoadingVin}
            />
            {isLoadingVin && (
              <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>
      )}

      {effectiveSetTrim && (
        <div>
          <Label htmlFor="vehicleTrim">Trim</Label>
          <div className="relative">
            <Input
              id="vehicleTrim"
              value={effectiveTrim || ''}
              onChange={(e) => effectiveSetTrim(e.target.value)}
              placeholder="Enter vehicle trim"
              autoComplete="off"
              disabled={isLoadingVin}
            />
            {isLoadingVin && (
              <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>
      )}

      {setColor && (
        <div>
          <Label htmlFor="vehicleColor">Color</Label>
          <div className="relative">
            <Input
              id="vehicleColor"
              value={color || ''}
              onChange={(e) => setColor(e.target.value)}
              placeholder="Enter vehicle color"
              autoComplete="off"
            />
          </div>
        </div>
      )}

      {setLicensePlate && (
        <div>
          <Label htmlFor="vehicleLicensePlate">License Plate</Label>
          <div className="relative">
            <Input
              id="vehicleLicensePlate"
              value={licensePlate || ''}
              onChange={(e) => setLicensePlate(e.target.value)}
              placeholder="Enter license plate"
              autoComplete="off"
            />
          </div>
        </div>
      )}
    </div>
  );
}
