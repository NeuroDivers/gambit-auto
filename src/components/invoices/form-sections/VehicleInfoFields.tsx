import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="vehicleMake">Vehicle Make</Label>
          <Input
            id="vehicleMake"
            value={vehicleMake}
            onChange={(e) => setVehicleMake(e.target.value)}
            placeholder="Enter vehicle make..."
            required
          />
        </div>
        <div>
          <Label htmlFor="vehicleModel">Vehicle Model</Label>
          <Input
            id="vehicleModel"
            value={vehicleModel}
            onChange={(e) => setVehicleModel(e.target.value)}
            placeholder="Enter vehicle model..."
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="vehicleYear">Vehicle Year</Label>
          <Input
            id="vehicleYear"
            type="number"
            value={vehicleYear}
            onChange={(e) => setVehicleYear(parseInt(e.target.value))}
            placeholder="Enter vehicle year..."
            required
          />
        </div>
        <div>
          <Label htmlFor="vehicleVin">Vehicle VIN</Label>
          <Input
            id="vehicleVin"
            value={vehicleVin}
            onChange={(e) => setVehicleVin(e.target.value)}
            placeholder="Enter vehicle VIN..."
            required
          />
        </div>
      </div>
    </div>
  )
}