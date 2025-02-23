
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useVinLookup } from "@/hooks/useVinLookup"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { VinScanner } from "@/components/shared/VinScanner"

type VehicleInfoFieldsProps = {
  vehicleMake: string
  setVehicleMake: (value: string) => void
  vehicleModel: string
  setVehicleModel: (value: string) => void
  vehicleYear: number
  setVehicleYear: (value: number) => void
  vehicleVin: string
  setVehicleVin: (value: string) => void
}

export function VehicleInfoFields({
  vehicleMake,
  setVehicleMake,
  vehicleModel,
  setVehicleModel,
  vehicleYear,
  setVehicleYear,
  vehicleVin,
  setVehicleVin,
}: VehicleInfoFieldsProps) {
  const { data: vinData, isLoading: isLoadingVin } = useVinLookup(vehicleVin)
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    if (vinData && !vinData.error) {
      if (vinData.make) setVehicleMake(vinData.make)
      if (vinData.model) setVehicleModel(vinData.model)
      if (vinData.year) setVehicleYear(vinData.year)
    }
  }, [vinData, setVehicleMake, setVehicleModel, setVehicleYear])

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const yearValue = parseInt(e.target.value)
    if (!isNaN(yearValue) && yearValue >= 1900 && yearValue <= currentYear + 1) {
      setVehicleYear(yearValue)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="vehicleMake">Vehicle Make</Label>
        <div className="relative">
          <Input
            id="vehicleMake"
            value={vehicleMake}
            onChange={(e) => setVehicleMake(e.target.value)}
            placeholder="Enter vehicle make..."
            autoComplete="off"
            disabled={isLoadingVin}
          />
          {isLoadingVin && (
            <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="vehicleModel">Vehicle Model</Label>
        <div className="relative">
          <Input
            id="vehicleModel"
            value={vehicleModel}
            onChange={(e) => setVehicleModel(e.target.value)}
            placeholder="Enter vehicle model..."
            autoComplete="off"
            disabled={isLoadingVin}
          />
          {isLoadingVin && (
            <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="vehicleYear">Vehicle Year</Label>
        <div className="relative">
          <Input
            id="vehicleYear"
            type="number"
            min={1900}
            max={currentYear + 1}
            value={vehicleYear || ''}
            onChange={handleYearChange}
            placeholder="Enter vehicle year..."
            autoComplete="off"
            disabled={isLoadingVin}
          />
          {isLoadingVin && (
            <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="vehicleVin">
          Vehicle VIN
          <span className="text-xs text-muted-foreground ml-2">(Auto-fills vehicle info)</span>
        </Label>
        <div className="flex gap-2">
          <Input
            id="vehicleVin"
            value={vehicleVin}
            onChange={(e) => setVehicleVin(e.target.value)}
            placeholder="Enter vehicle VIN..."
            autoComplete="off"
          />
          <VinScanner onScan={(vin) => setVehicleVin(vin)} />
        </div>
      </div>
    </div>
  )
}
