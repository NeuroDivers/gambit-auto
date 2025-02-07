
import { FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
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
  const handleServiceChange = (serviceId: string, checked: boolean, field: any) => {
    const currentValue = field.value || []
    const newValue = checked 
      ? [...currentValue, serviceId]
      : currentValue.filter((id: string) => id !== serviceId)
    field.onChange(newValue)
  }

  return (
    <FormField
      control={form.control}
      name="service_ids"
      render={() => (
        <FormItem className="rounded-lg border border-white/10 p-6 bg-black/20">
          <h3 className="text-lg font-medium text-white/90 mb-4">Available Services</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => (
              <FormField
                key={service.id}
                control={form.control}
                name="service_ids"
                render={({ field }) => {
                  const isChecked = field.value?.includes(service.id)
                  return (
                    <div
                      key={service.id}
                      className="flex flex-row items-center justify-between rounded-lg border border-white/10 hover:border-[#9b87f5] p-4 bg-[#1A1F2C] transition-all duration-200 group"
                    >
                      <div className="space-y-1">
                        <FormLabel className="text-base text-white/90 group-hover:text-white transition-colors duration-200">
                          {service.name}
                        </FormLabel>
                        {service.price && (
                          <p className="text-sm text-white/60">
                            Starting from ${service.price}
                          </p>
                        )}
                      </div>
                      <FormControl>
                        <Switch
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            handleServiceChange(service.id, checked, field)
                          }}
                          className="data-[state=checked]:bg-[#9b87f5]"
                        />
                      </FormControl>
                    </div>
                  )
                }}
              />
            ))}
          </div>
          <FormMessage className="mt-4" />
        </FormItem>
      )}
    />
  )
}
