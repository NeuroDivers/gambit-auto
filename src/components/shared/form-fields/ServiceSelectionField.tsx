
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Toggle } from "@/components/ui/toggle"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface ServiceSelectionFieldProps {
  services: string[]
  onServicesChange: (services: string[]) => void
}

export function ServiceSelectionField({ services, onServicesChange }: ServiceSelectionFieldProps) {
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

  return (
    <div className="space-y-4">
      <Label>Select Services</Label>
      <div className="flex flex-wrap gap-2">
        {serviceTypes?.map((service) => (
          <Toggle
            key={service.id}
            pressed={services.includes(service.id)}
            onPressedChange={(pressed) => {
              if (pressed) {
                onServicesChange([...services, service.id])
              } else {
                onServicesChange(services.filter((id) => id !== service.id))
              }
            }}
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
