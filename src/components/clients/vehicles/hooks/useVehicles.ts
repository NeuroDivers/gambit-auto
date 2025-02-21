
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Vehicle, VehicleFormValues } from "../types"
import { toast } from "sonner"

export function useVehicles(clientId: string) {
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
      console.log("Adding vehicle with values:", { ...values, client_id: clientId })

      // First, if this vehicle should be primary, unset any existing primary vehicles
      if (values.is_primary) {
        console.log("Unsetting existing primary vehicles")
        const { error: updateError } = await supabase
          .from('vehicles')
          .update({ is_primary: false })
          .eq('client_id', clientId)

        if (updateError) {
          console.error("Error unsetting primary vehicles:", updateError)
          throw updateError
        }
      }

      // Then insert the new vehicle
      const { data, error: insertError } = await supabase
        .from('vehicles')
        .insert([{ 
          ...values, 
          client_id: clientId,
          is_primary: values.is_primary // Explicitly set is_primary
        }])
        .select()
        .single()

      if (insertError) {
        console.error("Error inserting vehicle:", insertError)
        throw insertError
      }

      console.log("Successfully added vehicle:", data)
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles', clientId] })
      console.log("Vehicle added successfully:", data)
      if (data.is_primary) {
        toast.success("Vehicle saved and set as primary")
      } else {
        toast.success("Vehicle saved successfully")
      }
    },
    onError: (error) => {
      console.error("Vehicle mutation error:", error)
      toast.error("Failed to save vehicle")
    }
  })

  const updateVehicle = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: VehicleFormValues }) => {
      console.log("Updating vehicle:", id, "with values:", values)

      if (values.is_primary) {
        console.log("Unsetting other primary vehicles")
        const { error: updateError } = await supabase
          .from('vehicles')
          .update({ is_primary: false })
          .eq('client_id', clientId)
          .neq('id', id)

        if (updateError) {
          console.error("Error unsetting other primary vehicles:", updateError)
          throw updateError
        }
      }

      const { error } = await supabase
        .from('vehicles')
        .update({ ...values, is_primary: values.is_primary })
        .eq('id', id)

      if (error) {
        console.error("Error updating vehicle:", error)
        throw error
      }

      console.log("Vehicle updated successfully")
      return Promise.resolve()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles', clientId] })
      toast.success("Vehicle updated successfully")
    },
    onError: (error) => {
      console.error("Error updating vehicle:", error)
      toast.error(error.message)
    }
  })

  const deleteVehicle = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id)

      if (error) throw error
      return Promise.resolve()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles', clientId] })
      toast.success("Vehicle deleted successfully")
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  return {
    vehicles,
    isLoading,
    addVehicle,
    updateVehicle,
    deleteVehicle
  }
}
