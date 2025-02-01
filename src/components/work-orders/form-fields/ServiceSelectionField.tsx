import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Checkbox } from "@/components/ui/checkbox"
import type { WorkOrderFormValues } from "../WorkOrderFormFields"
import { Card, CardContent } from "@/components/ui/card"

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
          <Card className="border-border/10 bg-[#1A1F2C]">
            <CardContent className="p-4">
              <FormLabel className="text-lg font-semibold mb-4 block text-white">Services</FormLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <FormField
                    key={service.id}
                    control={form.control}
                    name="service_ids"
                    render={({ field }) => (
                      <FormItem
                        key={service.id}
                        className="flex flex-row items-center space-x-3 space-y-0 rounded-md border border-border/10 p-3 bg-[#221F26] hover:bg-[#2A2732] transition-colors"
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
                          className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                        />
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-white">
                            {service.name}
                            {service.price && (
                              <span className="text-primary ml-2">
                                ${service.price}
                              </span>
                            )}
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
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