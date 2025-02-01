import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ServiceType } from "./types"

type ServiceListProps = {
  services: ServiceType[]
  selectedServiceIds: string[]
  onAddService: (service: ServiceType) => void
}

export function ServiceList({ services, selectedServiceIds, onAddService }: ServiceListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {services
        .filter(service => !selectedServiceIds.includes(service.id))
        .map((service) => (
          <Button
            key={service.id}
            type="button"
            variant="outline"
            className="justify-start h-auto py-3 px-4"
            onClick={() => onAddService(service)}
          >
            <Plus className="mr-2 h-4 w-4" />
            <div className="text-left">
              <div className="font-medium">{service.name}</div>
              {service.price && (
                <div className="text-sm text-primary/70">
                  ${service.price}
                </div>
              )}
            </div>
          </Button>
        ))}
    </div>
  )
}