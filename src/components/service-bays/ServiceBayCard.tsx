import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { BayCardHeader } from "./card/BayCardHeader"
import { BayCardContent } from "./card/BayCardContent"

type ServiceBayCardProps = {
  bay: {
    id: string
    name: string
    status: 'available' | 'in_use' | 'maintenance'
    assigned_sidekick_id?: string | null
    notes?: string | null
  }
  services: {
    service_id: string
    name: string
    is_active: boolean
  }[]
  availableServices: {
    id: string
    name: string
    status?: 'active' | 'inactive'
  }[]
}

export function ServiceBayCard({ bay, services, availableServices }: ServiceBayCardProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const updateBayStatus = async (status: 'available' | 'in_use' | 'maintenance') => {
    try {
      const { error } = await supabase
        .from('service_bays')
        .update({ status })
        .eq('id', bay.id)

      if (error) throw error

      // Update only this specific bay's data in the cache
      queryClient.setQueryData(['serviceBays'], (oldData: any) => {
        if (!oldData) return oldData
        return oldData.map((oldBay: any) => 
          oldBay.id === bay.id ? { ...oldBay, status } : oldBay
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
        .eq('id', bay.id)

      if (error) throw error

      // Update only this specific bay's data in the cache
      queryClient.setQueryData(['serviceBays'], (oldData: any) => {
        if (!oldData) return oldData
        return oldData.map((oldBay: any) => 
          oldBay.id === bay.id ? { ...oldBay, notes } : oldBay
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
            bay_id: bay.id, 
            service_id: serviceId,
            is_active: true 
          })

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('bay_services')
          .delete()
          .eq('bay_id', bay.id)
          .eq('service_id', serviceId)

        if (error) throw error
      }

      // Update only this specific bay's services in the cache
      queryClient.setQueryData(['serviceBays'], (oldData: any) => {
        if (!oldData) return oldData
        return oldData.map((oldBay: any) => {
          if (oldBay.id !== bay.id) return oldBay
          
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

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <BayCardHeader 
        name={bay.name} 
        bayId={bay.id}
      />
      <BayCardContent
        bayId={bay.id}
        status={bay.status}
        assignedSidekickId={bay.assigned_sidekick_id}
        notes={bay.notes}
        services={services}
        availableServices={availableServices}
        onStatusChange={updateBayStatus}
        onNotesChange={updateBayNotes}
        onToggleService={toggleService}
      />
    </Card>
  )
}
