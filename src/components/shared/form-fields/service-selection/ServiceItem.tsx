import { FormField, FormItem, FormControl } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { ServiceItemType } from "@/components/work-orders/types"
import { UseFormReturn } from "react-hook-form"
import { FormLabel } from "@/components/ui/label"
import { SidekickAssignmentField } from "@/components/work-orders/form-fields/SidekickAssignmentField"

type ServiceItemProps = {
  form: UseFormReturn<any>
  service: {
    id: string
    name: string
    price: number | null
  }
  field: any
}

export function ServiceItem({ form, service, field }: ServiceItemProps) {
  const serviceItems: ServiceItemType[] = field.value || []
  const isSelected = serviceItems.some(
    item => item.service_id === service.id
  )

  return (
    <div className="space-y-2">
      <FormField
        control={form.control}
        name="service_items"
        render={() => (
          <FormItem
            className="flex flex-row items-center space-x-3 space-y-0 rounded-md border border-border/5 p-3 bg-[#221F26]/60 hover:bg-[#2A2732]/60 transition-colors"
          >
            <FormControl>
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
            </FormControl>
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
}