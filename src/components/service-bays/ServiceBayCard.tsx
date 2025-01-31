import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

type ServiceBayCardProps = {
  bay: {
    id: string
    name: string
    status: 'available' | 'in_use' | 'maintenance'
  }
  services: {
    id: string
    name: string
    is_active: boolean
  }[]
  availableServices: {
    id: string
    name: string
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

      toast({
        title: "Success",
        description: `Bay status updated to ${status}`,
      })

      queryClient.invalidateQueries({ queryKey: ['serviceBays'] })
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
          .insert({ bay_id: bay.id, service_id: serviceId })

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('bay_services')
          .delete()
          .eq('bay_id', bay.id)
          .eq('service_id', serviceId)

        if (error) throw error
      }

      toast({
        title: "Success",
        description: `Service ${isActive ? 'added to' : 'removed from'} bay`,
      })

      queryClient.invalidateQueries({ queryKey: ['serviceBays'] })
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
        <div>
          <Label className="mb-2 block">Bay Status</Label>
          <ToggleGroup type="single" value={bay.status} onValueChange={updateBayStatus}>
            <ToggleGroupItem value="available">Available</ToggleGroupItem>
            <ToggleGroupItem value="in_use">In Use</ToggleGroupItem>
            <ToggleGroupItem value="maintenance">Maintenance</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="space-y-4">
          <Label>Available Services</Label>
          {availableServices.map((service) => {
            const isActive = services.some(s => s.id === service.id)
            return (
              <div key={service.id} className="flex items-center justify-between">
                <span className="text-sm">{service.name}</span>
                <Switch
                  checked={isActive}
                  onCheckedChange={(checked) => toggleService(service.id, checked)}
                />
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}