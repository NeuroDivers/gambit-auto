import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { BayStatusToggle } from "./BayStatusToggle"
import { BayServiceToggles } from "./BayServiceToggles"
import { SidekickAssignment } from "./SidekickAssignment"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

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

      await queryClient.invalidateQueries({ queryKey: ['serviceBays'] })

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

      await queryClient.invalidateQueries({ queryKey: ['serviceBays'] })

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

      await queryClient.invalidateQueries({ queryKey: ['serviceBays'] })

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'in_use':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'maintenance':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      default:
        return ''
    }
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{bay.name}</CardTitle>
          <Badge className={`border ${getStatusColor(bay.status)}`}>
            {bay.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <BayStatusToggle 
          status={bay.status} 
          onStatusChange={updateBayStatus} 
        />
        <SidekickAssignment 
          bayId={bay.id}
          currentSidekickId={bay.assigned_sidekick_id}
        />
        <div className="space-y-2">
          <Label htmlFor={`notes-${bay.id}`}>Notes</Label>
          <Textarea
            id={`notes-${bay.id}`}
            placeholder="Add notes about this bay..."
            value={bay.notes || ''}
            onChange={(e) => updateBayNotes(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <BayServiceToggles
          availableServices={availableServices}
          activeServices={services}
          onToggleService={toggleService}
        />
      </CardContent>
    </Card>
  )
}