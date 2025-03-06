
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-lg font-medium">
          {vehicle.customer_vehicle_year} {vehicle.customer_vehicle_make} {vehicle.customer_vehicle_model}
        </p>
        {vehicle.customer_vehicle_color && (
          <p className="text-sm text-muted-foreground">
            Color: {vehicle.customer_vehicle_color}
          </p>
        )}
        {vehicle.customer_vehicle_vin && (
          <p className="text-sm text-muted-foreground">
            VIN: {vehicle.customer_vehicle_vin}
          </p>
        )}
        {vehicle.customer_vehicle_license_plate && (
          <p className="text-sm text-muted-foreground">
            License Plate: {vehicle.customer_vehicle_license_plate}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
