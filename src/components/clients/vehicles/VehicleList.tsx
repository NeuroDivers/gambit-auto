
import { Vehicle } from "./types"
import { Button } from "../../ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog"
import { useState } from "react"
import { VehicleForm } from "./VehicleForm"
import { useVehicles } from "./hooks/useVehicles"
import { VehicleCard } from "./VehicleCard"

interface VehicleListProps {
  clientId: string
}

export function VehicleList({ clientId }: VehicleListProps) {
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [isAddingVehicle, setIsAddingVehicle] = useState(false)
  const { vehicles, isLoading, addVehicle, updateVehicle, deleteVehicle } = useVehicles(clientId)

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      <Button onClick={() => setIsAddingVehicle(true)}>
        Add Vehicle
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vehicles?.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            onEdit={setEditingVehicle}
            onDelete={(id) => deleteVehicle.mutate(id)}
          />
        ))}
      </div>

      <Dialog open={isAddingVehicle} onOpenChange={setIsAddingVehicle}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Vehicle</DialogTitle>
          </DialogHeader>
          <VehicleForm 
            clientId={clientId}
            onSubmit={values => {
              addVehicle.mutate(values)
              setIsAddingVehicle(false)
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingVehicle} onOpenChange={() => setEditingVehicle(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
          </DialogHeader>
          {editingVehicle && (
            <VehicleForm 
              vehicle={editingVehicle}
              clientId={clientId}
              onSubmit={values => {
                updateVehicle.mutate({ id: editingVehicle.id, values })
                setEditingVehicle(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
