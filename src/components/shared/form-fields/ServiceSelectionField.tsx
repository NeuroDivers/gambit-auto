
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Toggle } from "@/components/ui/toggle"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { ServiceItemType } from "@/components/work-orders/types"
import { Input } from "@/components/ui/input"
import { ServiceTypesTable } from "@/integrations/supabase/types/service-types"

type ServiceType = ServiceTypesTable['Row']

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
      return data as ServiceType[]
    }
  })

  const handleServiceToggle = (service: ServiceType, pressed: boolean) => {
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

  // Group services by their type for better organization
  const groupedServices = serviceTypes?.reduce<Record<string, ServiceType[]>>((acc, service) => {
    const type = service.hierarchy_type || 'Other Services'
    if (!acc[type]) acc[type] = []
    acc[type].push(service)
    return acc
  }, {}) || {}

  return (
    <div className="space-y-6">
      <Label className="text-lg font-semibold">Select Services</Label>
      <div className="space-y-8">
        {Object.entries(groupedServices).map(([category, categoryServices]) => (
          <div key={category} className="space-y-4">
            <h3 className="text-base font-medium text-foreground/80 py-2">
              {category === 'main' ? 'Main Services' : 
               category === 'bundle' ? 'Service Bundles' :
               category === 'sub' ? 'Additional Services' :
               category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryServices.map((service) => {
                const selectedService = services.find(s => s.service_id === service.id)
                const isSelected = !!selectedService

                return (
                  <div key={service.id} className="space-y-4">
                    <Toggle
                      pressed={isSelected}
                      onPressedChange={(pressed) => handleServiceToggle(service, pressed)}
                      disabled={disabled}
                      className={cn(
                        "w-full h-auto flex-col items-start gap-1 px-4 py-3 rounded-lg border-2",
                        "data-[state=on]:bg-primary/5 data-[state=on]:text-primary data-[state=on]:border-primary",
                        "data-[state=off]:bg-background data-[state=off]:text-foreground data-[state=off]:border-input",
                        "hover:bg-accent hover:text-accent-foreground transition-colors",
                        "disabled:opacity-50"
                      )}
                    >
                      <div className="flex w-full justify-between items-center">
                        <span className="font-medium">{service.name}</span>
                        {service.price && (
                          <span className="text-sm text-muted-foreground">
                            ${service.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      {service.description && (
                        <p className="text-sm text-muted-foreground text-left line-clamp-2">
                          {service.description}
                        </p>
                      )}
                    </Toggle>

                    {isSelected && (
                      <div className="grid grid-cols-2 gap-4 px-4">
                        <div className="space-y-2">
                          <Label htmlFor={`quantity-${service.id}`} className="text-sm">
                            Quantity
                          </Label>
                          <Input
                            id={`quantity-${service.id}`}
                            type="number"
                            min={1}
                            value={selectedService.quantity}
                            onChange={(e) => handleQuantityChange(service.id, parseInt(e.target.value) || 1)}
                            disabled={disabled}
                            className="bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`price-${service.id}`} className="text-sm">
                            Unit Price
                          </Label>
                          <Input
                            id={`price-${service.id}`}
                            type="number"
                            min={0}
                            step="0.01"
                            value={selectedService.unit_price}
                            onChange={(e) => handlePriceChange(service.id, parseFloat(e.target.value) || 0)}
                            disabled={disabled}
                            className="bg-background"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
