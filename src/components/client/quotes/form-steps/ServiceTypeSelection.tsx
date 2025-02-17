
import { Card } from "@/components/ui/card"
import { ServiceTypesTable } from "@/integrations/supabase/types/service-types"
import { Check, ArrowRight } from "lucide-react"
import { ServiceItemType } from "@/hooks/quote-request/formSchema"
import { cn } from "@/lib/utils"

interface ServiceTypeSelectionProps {
  services: ServiceTypesTable["Row"][]
  selectedServices: ServiceItemType[]
  onServicesChange: (services: ServiceItemType[]) => void
}

export function ServiceTypeSelection({
  services,
  selectedServices,
  onServicesChange
}: ServiceTypeSelectionProps) {
  const handleServiceToggle = (service: ServiceTypesTable["Row"]) => {
    const isSelected = selectedServices.some(s => s.service_id === service.id)
    
    if (isSelected) {
      onServicesChange(selectedServices.filter(s => s.service_id !== service.id))
    } else {
      onServicesChange([
        ...selectedServices,
        {
          service_id: service.id,
          service_name: service.name,
          quantity: 1,
          unit_price: service.price || 0
        }
      ])
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {services?.map((service) => {
        const isSelected = selectedServices.some(s => s.service_id === service.id)
        
        return (
          <Card
            key={service.id}
            className={cn(
              "relative cursor-pointer transition-all hover:shadow-md group",
              isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
            )}
            onClick={() => handleServiceToggle(service)}
          >
            <div className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{service.name}</h3>
                  {service.price && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Starting from ${service.price.toFixed(2)}
                    </p>
                  )}
                  {service.description && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {service.description}
                    </p>
                  )}
                </div>
                <div className="shrink-0">
                  <div
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full border transition-colors",
                      isSelected 
                        ? 'bg-primary border-primary text-primary-foreground' 
                        : 'border-input group-hover:border-primary/50'
                    )}
                  >
                    {isSelected ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
