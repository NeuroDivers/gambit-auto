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
    id: string
    name: string
    is_active: boolean
  }[]
  onToggleService: (serviceId: string, isActive: boolean) => void
}

export function BayServiceToggles({ availableServices, activeServices, onToggleService }: BayServiceTogglesProps) {
  // Filter out inactive services
  const activeAvailableServices = availableServices.filter(service => service.status !== 'inactive')

  return (
    <div className="space-y-4">
      <Label>Available Services</Label>
      {activeAvailableServices.map((service) => {
        const isActive = activeServices.some(s => s.id === service.id)
        return (
          <div key={service.id} className="flex items-center justify-between">
            <span className="text-sm">{service.name}</span>
            <Switch
              checked={isActive}
              onCheckedChange={(checked) => onToggleService(service.id, checked)}
            />
          </div>
        )
      })}
    </div>
  )
}