
import { Vehicle } from "@/components/clients/vehicles/types"
import { FormControl } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus } from "lucide-react"

type VehicleSelectorProps = {
  vehicles: Vehicle[] | null
  isLoading: boolean
  selectedVehicleId?: string
  onVehicleSelect: (vehicleId: string) => void
}

export function VehicleSelector({ 
  vehicles, 
  isLoading, 
  selectedVehicleId,
  onVehicleSelect 
}: VehicleSelectorProps) {
  if (!vehicles || vehicles.length === 0) return null

  return (
    <div className="flex items-center space-x-2">
      <Select
        onValueChange={onVehicleSelect}
        value={selectedVehicleId}
        defaultValue="new"
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Choose a vehicle" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : (
            <>
              {vehicles.map((vehicle: Vehicle) => (
                <SelectItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.year} {vehicle.make} {vehicle.model}
                  {vehicle.is_primary && " (Primary)"}
                </SelectItem>
              ))}
              <SelectItem value="new">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Vehicle
                </div>
              </SelectItem>
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  )
}
