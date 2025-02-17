
import { Card } from "@/components/ui/card"
import { ServiceTypesTable } from "@/integrations/supabase/types/service-types"
import { Check } from "lucide-react"
import { ServiceItemType } from "@/hooks/quote-request/formSchema"

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
            className={`relative cursor-pointer transition-all hover:shadow-md ${
              isSelected ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleServiceToggle(service)}
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{service.name}</h3>
                  {service.price && (
                    <p className="text-sm text-muted-foreground">
                      Starting from ${service.price}
                    </p>
                  )}
                </div>
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${
                    isSelected 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : 'border-input'
                  }`}
                >
                  <Check className={`h-4 w-4 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                </div>
              </div>
              {service.description && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {service.description}
                </p>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
