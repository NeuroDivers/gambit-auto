import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export function useBayActions(bayId: string) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const updateBayStatus = async (status: 'available' | 'in_use' | 'maintenance') => {
    try {
      const { error } = await supabase
        .from('service_bays')
        .update({ status })
        .eq('id', bayId)

      if (error) throw error

      queryClient.setQueryData(['serviceBays'], (oldData: any) => {
        if (!oldData) return oldData
        return oldData.map((oldBay: any) => 
          oldBay.id === bayId ? { ...oldBay, status } : oldBay
        )
      })

      toast({
        title: "Success",
        description: `Bay status updated to ${status}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const updateBayNotes = async (notes: string) => {
    try {
      const { error } = await supabase
        .from('service_bays')
        .update({ notes })
        .eq('id', bayId)

      if (error) throw error

      queryClient.setQueryData(['serviceBays'], (oldData: any) => {
        if (!oldData) return oldData
        return oldData.map((oldBay: any) => 
          oldBay.id === bayId ? { ...oldBay, notes } : oldBay
        )
      })

      toast({
        title: "Success",
        description: "Bay notes updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const toggleService = async (serviceId: string, isActive: boolean) => {
    try {
      if (isActive) {
        const { error } = await supabase
          .from('bay_services')
          .insert({ 
            bay_id: bayId, 
            service_id: serviceId,
            is_active: true 
          })

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('bay_services')
          .delete()
          .eq('bay_id', bayId)
          .eq('service_id', serviceId)

        if (error) throw error
      }

      queryClient.setQueryData(['serviceBays'], (oldData: any) => {
        if (!oldData) return oldData
        return oldData.map((oldBay: any) => {
          if (oldBay.id !== bayId) return oldBay
          
          const updatedServices = isActive
            ? [...(oldBay.bay_services || []), { service_id: serviceId, is_active: true }]
            : (oldBay.bay_services || []).filter((s: any) => s.service_id !== serviceId)
          
          return { ...oldBay, bay_services: updatedServices }
        })
      })

      toast({
        title: "Success",
        description: `Service ${isActive ? 'added to' : 'removed from'} bay`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return {
    updateBayStatus,
    updateBayNotes,
    toggleService
  }
}