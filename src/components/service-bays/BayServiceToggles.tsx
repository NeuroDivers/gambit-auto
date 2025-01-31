import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

type BayServiceTogglesProps = {
  services: {
    id: string
    name: string
    is_active: boolean
  }[]
  availableServices: {
    id: string
    name: string
    status: 'active' | 'inactive'
  }[]
  onToggleService: (serviceId: string, isActive: boolean) => void
}

export function BayServiceToggles({ services, availableServices, onToggleService }: BayServiceTogglesProps) {
  // Filter out inactive services
  const activeAvailableServices = availableServices.filter(service => service.status === 'active')

  return (
    <div className="space-y-4">
      <Label>Available Services</Label>
      {activeAvailableServices.map((service) => {
        const isActive = services.some(s => s.id === service.id)
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