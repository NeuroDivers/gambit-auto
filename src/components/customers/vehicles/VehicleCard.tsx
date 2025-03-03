
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash } from "lucide-react"
import { Vehicle } from "./types"

interface VehicleCardProps {
  vehicle: Vehicle
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div>
            <h3 className="font-medium">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h3>
            <p className="text-sm text-muted-foreground">{vehicle.vin || "No VIN"}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <div className="text-muted-foreground">Color:</div>
          <div>{vehicle.color || "N/A"}</div>
          
          <div className="text-muted-foreground">License:</div>
          <div>{vehicle.license_plate || "N/A"}</div>
          
          <div className="text-muted-foreground">Mileage:</div>
          <div>N/A</div>
        </div>
      </CardContent>
    </Card>
  )
}
