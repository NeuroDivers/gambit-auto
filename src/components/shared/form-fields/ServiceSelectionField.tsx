import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"
import { Card, CardContent } from "@/components/ui/card"
import { ServiceItem } from "./service-selection/ServiceItem"
import { useServiceData } from "./service-selection/useServiceData"

type ServiceSelectionFieldProps = {
  form: UseFormReturn<any>
}

export function ServiceSelectionField({ form }: ServiceSelectionFieldProps) {
  const { data: services = [] } = useServiceData()

  return (
    <FormField
      control={form.control}
      name="service_items"
      render={({ field }) => (
        <FormItem>
          <Card className="border-border/5 bg-[#1A1F2C]/80">
            <CardContent className="p-4">
              <FormLabel className="text-lg font-semibold mb-4 block text-white/90">
                Services
              </FormLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <ServiceItem
                    key={service.id}
                    form={form}
                    service={service}
                    field={field}
                  />
                ))}
              </div>
              <FormMessage />
            </CardContent>
          </Card>
        </FormItem>
      )}
    />
  )
}