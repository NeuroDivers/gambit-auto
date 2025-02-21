
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Vehicle, VehicleFormValues } from "../types"
import { useToast } from "@/hooks/use-toast"

export function useVehicles(clientId: string) {
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
      // If setting as primary, first unset any existing primary vehicle
      if (values.is_primary) {
        const { error: updateError } = await supabase
          .from('vehicles')
          .update({ is_primary: false })
          .eq('client_id', clientId)
          .eq('is_primary', true)

        if (updateError) throw updateError
      }

      const { error } = await supabase
        .from('vehicles')
        .insert([{ ...values, client_id: clientId }])

      if (error) throw error
      return Promise.resolve()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
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
      // If setting as primary, first unset any existing primary vehicle
      if (values.is_primary) {
        const { error: updateError } = await supabase
          .from('vehicles')
          .update({ is_primary: false })
          .eq('client_id', clientId)
          .eq('is_primary', true)
          .neq('id', id) // Don't update the current vehicle

        if (updateError) throw updateError
      }

      const { error } = await supabase
        .from('vehicles')
        .update(values)
        .eq('id', id)

      if (error) throw error
      return Promise.resolve()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
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
      return Promise.resolve()
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

  return {
    vehicles,
    isLoading,
    addVehicle,
    updateVehicle,
    deleteVehicle
  }
}
