
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
        <FormItem>
          <FormLabel className="text-white/90">Services *</FormLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                      className="flex flex-row items-center justify-between rounded-lg border border-white/10 hover:border-[#D6BCFA] p-4 bg-black cursor-pointer transition-colors duration-200"
                      onClick={() => handleServiceChange(service.id, !isChecked, field)}
                    >
                      <div className="space-y-0.5">
                        <FormLabel className="text-base text-white/90">
                          {service.name}
                        </FormLabel>
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
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
