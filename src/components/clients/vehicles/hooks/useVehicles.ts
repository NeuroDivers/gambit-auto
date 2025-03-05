
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Vehicle, VehicleFormValues } from "../types"
import { toast } from "sonner"

export function useVehicles(clientId: string) {
  const queryClient = useQueryClient()

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['vehicles', clientId],
    queryFn: async () => {
      // Try to fetch using client_id first (legacy)
      const { data: clientVehicles, error: clientError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('client_id', clientId)
        .order('is_primary', { ascending: false })

      if (clientVehicles && clientVehicles.length > 0) {
        return clientVehicles as Vehicle[]
      }

      // If no vehicles found with client_id, try customer_id
      const { data: customerVehicles, error: customerError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('customer_id', clientId)
        .order('is_primary', { ascending: false })

      if (customerError) throw customerError
      return customerVehicles as Vehicle[]
    }
  })

  const addVehicle = useMutation({
    mutationFn: async (values: VehicleFormValues) => {
      console.log("Adding vehicle with values:", { ...values, client_id: clientId })

      // First, get the auth user to check if we're performing this operation in an authenticated context
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error("Authentication required to add vehicles")
      }

      // First, if this vehicle should be primary, unset any existing primary vehicles
      if (values.is_primary) {
        // Try to update using both client_id and customer_id
        await supabase
          .from('vehicles')
          .update({ is_primary: false })
          .eq('client_id', clientId)

        await supabase
          .from('vehicles')
          .update({ is_primary: false })
          .eq('customer_id', clientId)
      }

      // Then insert the new vehicle
      const { data, error: insertError } = await supabase
        .from('vehicles')
        .insert([{ 
          ...values, 
          client_id: clientId,
          customer_id: clientId, // Add both for compatibility
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
        // Try to update using both client_id and customer_id
        await supabase
          .from('vehicles')
          .update({ is_primary: false })
          .eq('client_id', clientId)
          .neq('id', id)

        await supabase
          .from('vehicles')
          .update({ is_primary: false })
          .eq('customer_id', clientId)
          .neq('id', id)
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
