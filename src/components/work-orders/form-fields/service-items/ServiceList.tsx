import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ServiceType, ServiceItemType } from "../types"

export type ServiceListProps = {
  workOrderServices: ServiceItemType[]
  onServicesChange: (newServices: ServiceItemType[]) => void
}

export function ServiceList({ workOrderServices, onServicesChange }: ServiceListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {workOrderServices.map((service, index) => (
        <Button
          key={index}
          type="button"
          variant="outline"
          className="justify-start h-auto py-3 px-4"
          onClick={() => {
            const newServices = [...workOrderServices]
            newServices.splice(index, 1)
            onServicesChange(newServices)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          <div className="text-left">
            <div className="font-medium">{service.service_name}</div>
            {service.unit_price && (
              <div className="text-sm text-primary/70">
                ${service.unit_price}
              </div>
            )}
          </div>
        </Button>
      ))}
    </div>
  )
}