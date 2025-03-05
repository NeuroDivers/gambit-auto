
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
          {vehicle.year} {vehicle.make} {vehicle.model}
        </p>
        {vehicle.color && (
          <p className="text-sm text-muted-foreground">
            Color: {vehicle.color}
          </p>
        )}
        {vehicle.vin && (
          <p className="text-sm text-muted-foreground">
            VIN: {vehicle.vin}
          </p>
        )}
        {vehicle.license_plate && (
          <p className="text-sm text-muted-foreground">
            License Plate: {vehicle.license_plate}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
