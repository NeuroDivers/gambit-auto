
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface VehicleInfoCardProps {
  year: number;
  make: string;
  model: string;
  vin?: string;
}

export function VehicleInfoCard({
  year,
  make,
  model,
  vin
}: VehicleInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <p className="font-medium">Vehicle</p>
          <p>{year} {make} {model}</p>
        </div>
        {vin && (
          <div>
            <p className="font-medium">VIN</p>
            <p>{vin}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
