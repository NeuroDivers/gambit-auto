
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function VehicleInfo({ vehicle }) {
  if (!vehicle) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vehicle</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No vehicle information available</p>
        </CardContent>
      </Card>
    )
  }

  // Check if the vehicle has the newer naming convention fields first
  // This handles both old and new data structures
  const year = vehicle.year || vehicle.customer_vehicle_year
  const make = vehicle.make || vehicle.customer_vehicle_make
  const model = vehicle.model || vehicle.customer_vehicle_model
  const color = vehicle.color || vehicle.customer_vehicle_color
  const vin = vehicle.vin || vehicle.customer_vehicle_vin
  const licensePlate = vehicle.license_plate || vehicle.customer_vehicle_license_plate

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-lg font-medium">
          {year} {make} {model}
        </p>
        {color && (
          <p className="text-sm text-muted-foreground">
            Color: {color}
          </p>
        )}
        {vin && (
          <p className="text-sm text-muted-foreground">
            VIN: {vin}
          </p>
        )}
        {licensePlate && (
          <p className="text-sm text-muted-foreground">
            License Plate: {licensePlate}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
