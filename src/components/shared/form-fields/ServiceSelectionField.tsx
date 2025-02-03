import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { ServiceItemType } from "@/components/work-orders/types"
import { SidekickAssignmentField } from "@/components/work-orders/form-fields/SidekickAssignmentField"

type ServiceSelectionFieldProps = {
  form: UseFormReturn<any>
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
      name="service_items"
      render={({ field }) => (
        <FormItem>
          <Card className="border-border/5 bg-[#1A1F2C]/80">
            <CardContent className="p-4">
              <FormLabel className="text-lg font-semibold mb-4 block text-white/90">Services</FormLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => {
                  const serviceItems: ServiceItemType[] = field.value || []
                  const isSelected = serviceItems.some(
                    item => item.service_id === service.id
                  )

                  return (
                    <div key={service.id} className="space-y-2">
                      <FormField
                        control={form.control}
                        name="service_items"
                        render={() => (
                          <FormItem
                            className="flex flex-row items-center space-x-3 space-y-0 rounded-md border border-border/5 p-3 bg-[#221F26]/60 hover:bg-[#2A2732]/60 transition-colors"
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => {
                                const currentItems = field.value || []
                                if (checked) {
                                  field.onChange([
                                    ...currentItems,
                                    {
                                      service_id: service.id,
                                      service_name: service.name,
                                      quantity: 1,
                                      unit_price: service.price || 0
                                    }
                                  ])
                                } else {
                                  field.onChange(
                                    currentItems.filter(
                                      (item: ServiceItemType) => item.service_id !== service.id
                                    )
                                  )
                                  // Clear sidekick assignment when service is unselected
                                  form.setValue(`sidekick_assignments.${service.id}`, undefined)
                                }
                              }}
                              className="border-primary/50 data-[state=checked]:bg-primary/70 data-[state=checked]:text-primary-foreground"
                            />
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-white/80">
                                {service.name}
                                {service.price && (
                                  <span className="text-primary/70 ml-2">
                                    ${service.price}
                                  </span>
                                )}
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      {isSelected && (
                        <SidekickAssignmentField 
                          form={form}
                          serviceId={service.id}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
              <FormMessage />
            </CardContent>
          </Card>
        </FormItem>
      )}
    />
  )
}