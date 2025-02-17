
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Toggle } from "@/components/ui/toggle"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { ServiceItemType } from "@/components/work-orders/types"
import { Input } from "@/components/ui/input"

interface ServiceSelectionFieldProps {
  services: ServiceItemType[]
  onServicesChange: (services: ServiceItemType[]) => void
  disabled?: boolean
}

export function ServiceSelectionField({ 
  services, 
  onServicesChange,
  disabled 
}: ServiceSelectionFieldProps) {
  const { data: serviceTypes } = useQuery({
    queryKey: ["service-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("*")
        .eq("status", "active")
        .order("sort_order", { ascending: true })

      if (error) throw error
      return data
    }
  })

  const handleServiceToggle = (service: any, pressed: boolean) => {
    if (pressed) {
      onServicesChange([
        ...services,
        {
          service_id: service.id,
          service_name: service.name,
          quantity: 1,
          unit_price: service.price || 0
        }
      ])
    } else {
      onServicesChange(
        services.filter((s) => s.service_id !== service.id)
      )
    }
  }

  const handleQuantityChange = (serviceId: string, quantity: number) => {
    onServicesChange(
      services.map((service) =>
        service.service_id === serviceId
          ? { ...service, quantity }
          : service
      )
    )
  }

  const handlePriceChange = (serviceId: string, price: number) => {
    onServicesChange(
      services.map((service) =>
        service.service_id === serviceId
          ? { ...service, unit_price: price }
          : service
      )
    )
  }

  return (
    <div className="space-y-4">
      <Label>Select Services</Label>
      <div className="flex flex-col gap-4">
        {serviceTypes?.map((service) => {
          const selectedService = services.find(s => s.service_id === service.id)
          const isSelected = !!selectedService

          return (
            <div key={service.id} className="space-y-4">
              <Toggle
                pressed={isSelected}
                onPressedChange={(pressed) => handleServiceToggle(service, pressed)}
                disabled={disabled}
                className={cn(
                  "border-2 w-full justify-start",
                  "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
                  "data-[state=off]:bg-background data-[state=off]:text-foreground",
                  "hover:bg-muted hover:text-muted-foreground"
                )}
              >
                {service.name}
              </Toggle>

              {isSelected && (
                <div className="grid grid-cols-2 gap-4 px-4">
                  <div>
                    <Label htmlFor={`quantity-${service.id}`}>Quantity</Label>
                    <Input
                      id={`quantity-${service.id}`}
                      type="number"
                      min={1}
                      value={selectedService.quantity}
                      onChange={(e) => handleQuantityChange(service.id, parseInt(e.target.value) || 1)}
                      disabled={disabled}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`price-${service.id}`}>Unit Price</Label>
                    <Input
                      id={`price-${service.id}`}
                      type="number"
                      min={0}
                      step="0.01"
                      value={selectedService.unit_price}
                      onChange={(e) => handlePriceChange(service.id, parseFloat(e.target.value) || 0)}
                      disabled={disabled}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
