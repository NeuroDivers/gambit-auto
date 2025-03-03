
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash, Star } from "lucide-react"
import { Vehicle } from "./types"
import { useState } from "react"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { useVehicles } from "./hooks/useVehicles"

interface VehicleCardProps {
  vehicle: Vehicle
  onEdit: (vehicle: Vehicle) => void
}

export function VehicleCard({ vehicle, onEdit }: VehicleCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { deleteVehicle } = useVehicles(vehicle.customer_id)

  const handleDelete = async () => {
    await deleteVehicle.mutateAsync(vehicle.id)
    setShowDeleteConfirm(false)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h3>
              {vehicle.is_primary && (
                <Star className="h-4 w-4 fill-primary text-primary" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">{vehicle.vin || "No VIN"}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => onEdit(vehicle)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowDeleteConfirm(true)}>
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
          
          {vehicle.body_class && (
            <>
              <div className="text-muted-foreground">Body Type:</div>
              <div>{vehicle.body_class}</div>
            </>
          )}
          
          {vehicle.trim && (
            <>
              <div className="text-muted-foreground">Trim:</div>
              <div>{vehicle.trim}</div>
            </>
          )}
          
          {vehicle.doors && (
            <>
              <div className="text-muted-foreground">Doors:</div>
              <div>{vehicle.doors}</div>
            </>
          )}
        </div>
        
        {vehicle.notes && (
          <div className="mt-2 pt-2 border-t text-sm">
            <div className="text-muted-foreground mb-1">Notes:</div>
            <div>{vehicle.notes}</div>
          </div>
        )}
      </CardContent>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vehicle</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {vehicle.year} {vehicle.make} {vehicle.model}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
