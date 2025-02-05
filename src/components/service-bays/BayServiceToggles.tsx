import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

type ServiceType = {
  id: string
  name: string
  status?: 'active' | 'inactive'
}

type BayServiceTogglesProps = {
  availableServices: ServiceType[]
  activeServices: {
    service_id: string
    name: string
    is_active: boolean
  }[]
  onToggleService: (serviceId: string, isActive: boolean) => void
}

export function BayServiceToggles({ availableServices, activeServices, onToggleService }: BayServiceTogglesProps) {
  const activeAvailableServices = availableServices.filter(service => service.status !== 'inactive')

  return (
    <div className="space-y-4">
      <Label className="text-lg font-medium">Available Services</Label>
      <div className="grid gap-3">
        {activeAvailableServices.map((service) => {
          const isActive = activeServices.some(s => s.service_id === service.id)
          return (
            <div 
              key={service.id} 
              className="flex items-center justify-between p-3 rounded-lg bg-card/50 hover:bg-accent/10 transition-colors"
            >
              <span className="text-sm font-medium">{service.name}</span>
              <Switch
                checked={isActive}
                onCheckedChange={(checked) => onToggleService(service.id, checked)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}