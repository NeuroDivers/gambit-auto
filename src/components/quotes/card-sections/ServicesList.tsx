
import { Badge } from "@/components/ui/badge"

interface ServicesListProps {
  serviceIds: string[]
  services: any[]
}

export function ServicesList({ serviceIds, services }: ServicesListProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Requested Services:</h4>
      <div className="flex flex-wrap gap-2">
        {serviceIds.map((serviceId) => {
          const service = services?.find(s => s.id === serviceId)
          return service ? (
            <Badge key={serviceId} variant="outline">
              {service.name}
            </Badge>
          ) : null
        })}
      </div>
    </div>
  )
}
