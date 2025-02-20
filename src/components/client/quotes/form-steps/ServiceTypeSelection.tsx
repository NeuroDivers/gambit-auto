
import { Check } from "lucide-react"
import { ServiceItemType } from "@/types/quote-request"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ServiceTypeSelectionProps {
  services: {
    id: string
    name: string
    description: string | null
  }[]
  selectedServices: ServiceItemType[]
  onServicesChange: (services: ServiceItemType[]) => void
}

export function ServiceTypeSelection({
  services,
  selectedServices,
  onServicesChange,
}: ServiceTypeSelectionProps) {
  const toggleService = (service: { id: string; name: string }) => {
    const isSelected = selectedServices.some(
      (s) => s.service_id === service.id
    )

    if (isSelected) {
      onServicesChange(
        selectedServices.filter((s) => s.service_id !== service.id)
      )
    } else {
      onServicesChange([
        ...selectedServices,
        {
          service_id: service.id,
          service_name: service.name,
          quantity: 1,
          unit_price: 0,
        },
      ])
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {services.map((service) => {
        const isSelected = selectedServices.some(
          (s) => s.service_id === service.id
        )

        return (
          <Button
            key={service.id}
            type="button"
            variant="outline"
            className={cn(
              "h-auto p-4 justify-start space-y-2",
              isSelected && "border-primary"
            )}
            onClick={() => toggleService(service)}
          >
            <div className="flex items-start justify-between w-full">
              <div className="space-y-1 text-left">
                <p className="text-sm font-medium leading-none">
                  {service.name}
                </p>
                {service.description && (
                  <p className="text-sm text-muted-foreground whitespace-normal break-words">
                    {service.description}
                  </p>
                )}
              </div>
              {isSelected && (
                <Check className="h-4 w-4 text-primary shrink-0" />
              )}
            </div>
          </Button>
        )
      })}
    </div>
  )
}
