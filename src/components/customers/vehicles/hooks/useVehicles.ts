
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Vehicle } from "../types"
import { toast } from "sonner"

export function useVehicles(customerId: string) {
  const queryClient = useQueryClient()

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['vehicles', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('customer_id', customerId)
        .order('is_primary', { ascending: false })
        
      if (error) {
        toast.error("Failed to load vehicles")
        console.error("Error loading vehicles:", error)
        throw error
      }
      
      return data as Vehicle[]
    }
  })

  const addVehicle = useMutation({
    mutationFn: async (newVehicle: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('vehicles')
        .insert({ ...newVehicle, customer_id: customerId })
        .select()
        .single()
      
      if (error) {
        toast.error("Failed to add vehicle")
        throw error
      }
      
      toast.success("Vehicle added successfully")
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles', customerId] })
    }
  })

  const updateVehicle = useMutation({
    mutationFn: async (vehicle: Partial<Vehicle> & { id: string }) => {
      const { data, error } = await supabase
        .from('vehicles')
        .update(vehicle)
        .eq('id', vehicle.id)
        .select()
        .single()
      
      if (error) {
        toast.error("Failed to update vehicle")
        throw error
      }
      
      toast.success("Vehicle updated successfully")
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles', customerId] })
    }
  })

  const deleteVehicle = useMutation({
    mutationFn: async (vehicleId: string) => {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId)
      
      if (error) {
        toast.error("Failed to delete vehicle")
        throw error
      }
      
      toast.success("Vehicle deleted successfully")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles', customerId] })
    }
  })

  return {
    vehicles: vehicles || [],
    isLoading,
    addVehicle: addVehicle.mutate,
    updateVehicle: updateVehicle.mutate,
    deleteVehicle: deleteVehicle.mutate
  }
}
