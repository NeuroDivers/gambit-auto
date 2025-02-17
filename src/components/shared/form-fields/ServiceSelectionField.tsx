
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Toggle } from "@/components/ui/toggle"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { ServiceItemType } from "@/components/work-orders/types"

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

  return (
    <div className="space-y-4">
      <Label>Select Services</Label>
      <div className="flex flex-wrap gap-2">
        {serviceTypes?.map((service) => (
          <Toggle
            key={service.id}
            pressed={services.some(s => s.service_id === service.id)}
            onPressedChange={(pressed) => handleServiceToggle(service, pressed)}
            disabled={disabled}
            className={cn(
              "border-2",
              "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
              "data-[state=off]:bg-background data-[state=off]:text-foreground",
              "hover:bg-muted hover:text-muted-foreground"
            )}
          >
            {service.name}
          </Toggle>
        ))}
      </div>
    </div>
  )
}
