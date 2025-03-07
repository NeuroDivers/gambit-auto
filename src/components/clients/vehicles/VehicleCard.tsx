
import { Vehicle } from "./types"
import { Card, CardContent } from "../../ui/card"
import { Button } from "../../ui/button"
import { Edit, Trash, Star } from "lucide-react"

interface VehicleCardProps {
  vehicle: Vehicle
  onEdit: (vehicle: Vehicle) => void
  onDelete: (id: string) => void
}

export function VehicleCard({ vehicle, onEdit, onDelete }: VehicleCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">
                {vehicle.customer_vehicle_year} {vehicle.customer_vehicle_make} {vehicle.customer_vehicle_model}
              </h3>
              {vehicle.is_primary && (
                <Star className="h-4 w-4 fill-primary text-primary" />
              )}
            </div>
            {vehicle.customer_vehicle_vin && (
              <p className="text-sm text-muted-foreground">
                VIN: {vehicle.customer_vehicle_vin}
              </p>
            )}
            {vehicle.customer_vehicle_license_plate && (
              <p className="text-sm text-muted-foreground">
                License: {vehicle.customer_vehicle_license_plate}
              </p>
            )}
            {vehicle.customer_vehicle_color && (
              <p className="text-sm text-muted-foreground">
                Color: {vehicle.customer_vehicle_color}
              </p>
            )}
            {vehicle.notes && (
              <p className="text-sm text-muted-foreground mt-2">
                {vehicle.notes}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(vehicle)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(vehicle.id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
