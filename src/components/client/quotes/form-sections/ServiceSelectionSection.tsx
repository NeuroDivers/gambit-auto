
import { FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { UseFormReturn } from "react-hook-form"
import * as z from "zod"

type ServiceType = {
  id: string
  name: string
  price: number | null
  status: string
}

type ServiceSelectionSectionProps = {
  form: UseFormReturn<z.infer<typeof formSchema>>
  services: ServiceType[]
}

const formSchema = z.object({
  service_ids: z.array(z.string()).min(1, "Please select at least one service")
})

export function ServiceSelectionSection({ form, services }: ServiceSelectionSectionProps) {
  const handleServiceToggle = (serviceId: string, currentValue: string[]) => {
    const updated = currentValue.includes(serviceId)
      ? currentValue.filter((id) => id !== serviceId)
      : [...currentValue, serviceId]
    return updated
  }

  return (
    <FormField
      control={form.control}
      name="service_ids"
      render={() => (
        <FormItem>
          <FormLabel>Service Types</FormLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <FormField
                key={service.id}
                control={form.control}
                name="service_ids"
                render={({ field }) => {
                  return (
                    <FormItem
                      key={service.id}
                      className="flex flex-col items-start space-y-0"
                    >
                      <FormControl>
                        <Card
                          className={`w-full cursor-pointer transition-all ${
                            field.value?.includes(service.id)
                              ? "border-primary bg-primary/5"
                              : ""
                          }`}
                          onClick={() => {
                            const updated = handleServiceToggle(service.id, field.value || [])
                            field.onChange(updated)
                          }}
                        >
                          <CardContent className="flex items-center space-x-4 p-4">
                            <Checkbox
                              checked={field.value?.includes(service.id)}
                              onCheckedChange={() => {
                                const updated = handleServiceToggle(service.id, field.value || [])
                                field.onChange(updated)
                              }}
                            />
                            <div className="flex-1">
                              <h4 className="font-medium">{service.name}</h4>
                              {service.price && (
                                <p className="text-sm text-muted-foreground">
                                  Starting from ${service.price}
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </FormControl>
                    </FormItem>
                  )
                }}
              />
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
