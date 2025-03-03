
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Vehicle, VehicleFormValues } from "../types"
import { toast } from "sonner"

export function useVehicles(customerId: string) {
  const queryClient = useQueryClient()

  const { data: vehicles, isLoading, error } = useQuery({
    queryKey: ['customer_vehicles', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('customer_id', customerId)
        .order('is_primary', { ascending: false })

      if (error) throw error
      
      // Ensure is_primary is set for all vehicles
      const processedData = data.map(vehicle => ({
        ...vehicle,
        is_primary: vehicle.is_primary === null ? false : vehicle.is_primary
      })) as Vehicle[]
      
      return processedData
    }
  })

  const addVehicle = useMutation({
    mutationFn: async (values: VehicleFormValues) => {
      console.log("Adding vehicle with values:", { ...values, customer_id: customerId })

      // First, if this vehicle should be primary, unset any existing primary vehicles
      if (values.is_primary) {
        console.log("Unsetting existing primary vehicles")
        const { error: updateError } = await supabase
          .from('vehicles')
          .update({ is_primary: false })
          .eq('customer_id', customerId)

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
          customer_id: customerId,
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
      queryClient.invalidateQueries({ queryKey: ['customer_vehicles', customerId] })
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
          .eq('customer_id', customerId)
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
      queryClient.invalidateQueries({ queryKey: ['customer_vehicles', customerId] })
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
      queryClient.invalidateQueries({ queryKey: ['customer_vehicles', customerId] })
      toast.success("Vehicle deleted successfully")
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const setPrimaryVehicle = useMutation({
    mutationFn: async (vehicleId: string) => {
      console.log("Setting primary vehicle:", vehicleId)
      
      // First, unset all existing primary vehicles for this customer
      const { error: unsettingError } = await supabase
        .from('vehicles')
        .update({ is_primary: false })
        .eq('customer_id', customerId)
      
      if (unsettingError) {
        console.error("Error unsetting primary vehicles:", unsettingError)
        throw unsettingError
      }
      
      // Then set the selected vehicle as primary
      const { error: settingError } = await supabase
        .from('vehicles')
        .update({ is_primary: true })
        .eq('id', vehicleId)
      
      if (settingError) {
        console.error("Error setting primary vehicle:", settingError)
        throw settingError
      }
      
      return Promise.resolve()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer_vehicles', customerId] })
    },
    onError: (error) => {
      console.error("Error setting primary vehicle:", error)
      toast.error("Failed to set primary vehicle")
    }
  })

  return {
    vehicles,
    isLoading,
    error,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    setPrimaryVehicle
  }
}
