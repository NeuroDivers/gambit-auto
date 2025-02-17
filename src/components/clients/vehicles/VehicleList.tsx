
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Vehicle } from "./types"
import { Card, CardContent } from "../../ui/card"
import { Button } from "../../ui/button"
import { Edit, Trash, Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog"
import { useState } from "react"
import { VehicleForm } from "./VehicleForm"
import { VehicleFormValues } from "./types"

interface VehicleListProps {
  clientId: string
}

export function VehicleList({ clientId }: VehicleListProps) {
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [isAddingVehicle, setIsAddingVehicle] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['vehicles', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('client_id', clientId)
        .order('is_primary', { ascending: false })

      if (error) throw error
      return data as Vehicle[]
    }
  })

  const addVehicle = useMutation({
    mutationFn: async (values: VehicleFormValues) => {
      const { error } = await supabase
        .from('vehicles')
        .insert([{ ...values, client_id: clientId }])

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      setIsAddingVehicle(false)
      toast({
        title: "Success",
        description: "Vehicle added successfully",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  })

  const updateVehicle = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: VehicleFormValues }) => {
      const { error } = await supabase
        .from('vehicles')
        .update(values)
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      setEditingVehicle(null)
      toast({
        title: "Success",
        description: "Vehicle updated successfully",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  })

  const deleteVehicle = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      toast({
        title: "Success",
        description: "Vehicle deleted successfully",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  })

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
          <Card key={vehicle.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>
                    {vehicle.is_primary && (
                      <Star className="h-4 w-4 fill-primary text-primary" />
                    )}
                  </div>
                  {vehicle.vin && (
                    <p className="text-sm text-muted-foreground">
                      VIN: {vehicle.vin}
                    </p>
                  )}
                  {vehicle.license_plate && (
                    <p className="text-sm text-muted-foreground">
                      License: {vehicle.license_plate}
                    </p>
                  )}
                  {vehicle.color && (
                    <p className="text-sm text-muted-foreground">
                      Color: {vehicle.color}
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
                    onClick={() => setEditingVehicle(vehicle)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteVehicle.mutate(vehicle.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isAddingVehicle} onOpenChange={setIsAddingVehicle}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Vehicle</DialogTitle>
          </DialogHeader>
          <VehicleForm 
            clientId={clientId}
            onSubmit={values => addVehicle.mutate(values)}
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
              onSubmit={values => updateVehicle.mutate({ id: editingVehicle.id, values })}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
