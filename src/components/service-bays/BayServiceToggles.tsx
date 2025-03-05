
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

type BayServiceTogglesProps = {
  availableServices: {
    id: string
    name: string
    status?: 'active' | 'inactive'
  }[]
  activeServices: {
    service_id: string
    name: string
    is_active: boolean
  }[]
  onToggleService: (serviceId: string, isActive: boolean) => void
}

export function BayServiceToggles({
  availableServices,
  activeServices,
  onToggleService,
}: BayServiceTogglesProps) {
  // Filter active services
  const activeServiceIds = activeServices
    .filter(service => service.is_active)
    .map(service => service.service_id)

  const isActive = (serviceId: string) => {
    return activeServiceIds.includes(serviceId)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[200px] overflow-y-auto p-1">
      {availableServices.map(service => (
        <div 
          key={service.id}
          className={`flex items-center space-x-2 p-2 rounded-md transition-colors ${
            isActive(service.id) 
              ? 'bg-primary/10 border border-primary/20' 
              : 'hover:bg-muted/50'
          }`}
        >
          <Checkbox
            id={`service-${service.id}`}
            checked={isActive(service.id)}
            onCheckedChange={(checked) => {
              onToggleService(service.id, checked === true)
            }}
            className={isActive(service.id) ? 'border-primary' : ''}
          />
          <Label
            htmlFor={`service-${service.id}`}
            className={`text-sm font-medium cursor-pointer flex-1 ${isActive(service.id) ? 'text-primary' : ''}`}
          >
            {service.name}
          </Label>
        </div>
      ))}
    </div>
  )
}
