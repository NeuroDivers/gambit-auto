
import { useState, useEffect } from "react"
import { useVehicles } from "./hooks/useVehicles"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { VehicleCard } from "./VehicleCard"
import { toast } from "sonner"

interface VehicleListProps {
  customerId: string
}

export function VehicleList({ customerId }: VehicleListProps) {
  const { vehicles, isLoading, error } = useVehicles(customerId)
  
  useEffect(() => {
    if (error) {
      toast.error("Failed to load vehicles")
      console.error("Error loading vehicles:", error)
    }
  }, [error])

  if (isLoading) {
    return <div className="p-6">Loading vehicles...</div>
  }

  if (!vehicles || vehicles.length === 0) {
    return (
      <Card className="p-8 flex flex-col items-center justify-center text-center">
        <h3 className="font-medium text-lg mb-2">No Vehicles</h3>
        <p className="text-muted-foreground mb-4">This customer has no vehicles registered.</p>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Vehicle
        </Button>
      </Card>
    )
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Vehicles ({vehicles.length})</h3>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Vehicle
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>
    </div>
  )
}
