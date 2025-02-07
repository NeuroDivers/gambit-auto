
import { FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form"
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
          <FormLabel>Service Types</FormLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.map((service) => (
              <FormField
                key={service.id}
                control={form.control}
                name="service_ids"
                render={({ field }) => {
                  const isChecked = field.value?.includes(service.id)
                  return (
                    <FormItem key={service.id}>
                      <FormControl>
                        <div
                          className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer bg-white
                            ${isChecked 
                              ? 'border-primary bg-primary/5' 
                              : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'}`}
                          onClick={() => handleServiceChange(service.id, !isChecked, field)}
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{service.name}</h4>
                            {service.price && (
                              <p className="text-sm text-gray-500">
                                Starting from ${service.price}
                              </p>
                            )}
                          </div>
                          <div 
                            className={`w-12 h-6 rounded-full transition-all relative
                              ${isChecked ? 'bg-primary' : 'bg-gray-200'}`}
                          >
                            <div 
                              className={`w-5 h-5 rounded-full bg-white absolute top-0.5 shadow-sm transition-transform
                                ${isChecked ? 'translate-x-6' : 'translate-x-1'}`}
                            />
                          </div>
                        </div>
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
