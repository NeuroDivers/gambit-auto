
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useVinLookup } from "@/hooks/useVinLookup"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

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

  useEffect(() => {
    if (vinData && !vinData.error) {
      if (vinData.make) setVehicleMake(vinData.make)
      if (vinData.model) setVehicleModel(vinData.model)
      if (vinData.year) setVehicleYear(vinData.year)
    }
  }, [vinData, setVehicleMake, setVehicleModel, setVehicleYear])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="vehicleMake">Vehicle Make</Label>
          <div className="relative">
            <Input
              id="vehicleMake"
              value={vehicleMake}
              onChange={(e) => setVehicleMake(e.target.value)}
              placeholder="Enter vehicle make..."
              required
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
              required
              autoComplete="off"
              disabled={isLoadingVin}
            />
            {isLoadingVin && (
              <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="vehicleYear">Vehicle Year</Label>
          <div className="relative">
            <Input
              id="vehicleYear"
              type="number"
              value={vehicleYear}
              onChange={(e) => setVehicleYear(parseInt(e.target.value))}
              placeholder="Enter vehicle year..."
              required
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
          <Input
            id="vehicleVin"
            value={vehicleVin}
            onChange={(e) => setVehicleVin(e.target.value)}
            placeholder="Enter vehicle VIN..."
            required
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  )
}
