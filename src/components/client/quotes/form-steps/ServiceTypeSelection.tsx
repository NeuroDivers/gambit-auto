
import { ServiceType } from "@/integrations/supabase/types/service-types"
import { ServiceItemType } from "@/types/quote-request"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"
import { useState } from "react"

type ServiceTypeSelectionProps = {
  services: ServiceType[]
  selectedServices: ServiceItemType[]
  onServicesChange: (services: ServiceItemType[]) => void
}

export function ServiceTypeSelection({ 
  services, 
  selectedServices, 
  onServicesChange 
}: ServiceTypeSelectionProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  const handleAddService = (service: ServiceType) => {
    const newService: ServiceItemType = {
      service_id: service.id,
      service_name: service.name,
      quantity: 1,
      unit_price: service.base_price || 0
    }
    onServicesChange([...selectedServices, newService])
    setQuantities({ ...quantities, [service.id]: 1 })
  }

  const handleRemoveService = (serviceId: string) => {
    onServicesChange(selectedServices.filter(s => s.service_id !== serviceId))
    const newQuantities = { ...quantities }
    delete newQuantities[serviceId]
    setQuantities(newQuantities)
  }

  const handleUpdateQuantity = (serviceId: string, quantity: number) => {
    const newQuantity = Math.max(1, quantity)
    setQuantities({ ...quantities, [serviceId]: newQuantity })
    onServicesChange(
      selectedServices.map(s => 
        s.service_id === serviceId 
          ? { ...s, quantity: newQuantity }
          : s
      )
    )
  }

  return (
    <div className="space-y-4">
      {services.map(service => {
        const isSelected = selectedServices.some(s => s.service_id === service.id)
        const quantity = quantities[service.id] || 1

        return (
          <div 
            key={service.id} 
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div>
              <h3 className="font-medium">{service.name}</h3>
              {service.description && (
                <p className="text-sm text-muted-foreground">{service.description}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              {isSelected && (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleUpdateQuantity(service.id, quantity - 1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center">{quantity}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleUpdateQuantity(service.id, quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <Button
                type="button"
                variant={isSelected ? "destructive" : "outline"}
                onClick={() => isSelected 
                  ? handleRemoveService(service.id)
                  : handleAddService(service)
                }
              >
                {isSelected ? "Remove" : "Add"}
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
