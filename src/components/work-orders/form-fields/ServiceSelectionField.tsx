import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Checkbox } from "@/components/ui/checkbox"
import type { WorkOrderFormValues } from "../WorkOrderFormFields"

type ServiceSelectionFieldProps = {
  form: UseFormReturn<WorkOrderFormValues>
}

export function ServiceSelectionField({ form }: ServiceSelectionFieldProps) {
  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("id, name, price")
        .eq("status", "active")
      
      if (error) throw error
      return data
    }
  })

  return (
    <FormField
      control={form.control}
      name="service_ids"
      render={() => (
        <FormItem>
          <FormLabel>Services</FormLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => (
              <FormField
                key={service.id}
                control={form.control}
                name="service_ids"
                render={({ field }) => {
                  return (
                    <FormItem
                      key={service.id}
                      className="flex flex-row items-start space-x-3 space-y-0"
                    >
                      <Checkbox
                        checked={field.value?.includes(service.id)}
                        onCheckedChange={(checked) => {
                          return checked
                            ? field.onChange([...field.value, service.id])
                            : field.onChange(
                                field.value?.filter(
                                  (value: string) => value !== service.id
                                )
                              )
                        }}
                      />
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          {service.name}
                          {service.price && ` - $${service.price}`}
                        </FormLabel>
                      </div>
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