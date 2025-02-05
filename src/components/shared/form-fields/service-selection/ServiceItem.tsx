import React from 'react';
import { FormField, FormItem, FormControl, FormLabel } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { ServiceItemType } from "@/components/work-orders/types"
import { UseFormReturn } from "react-hook-form"

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

  const selectedItem = serviceItems.find(
    item => item.service_id === service.id
  )

  return (
    <div className="space-y-2">
      <FormField
        control={form.control}
        name="service_items"
        render={() => (
          <FormItem
            className="flex flex-col space-y-3 rounded-md border border-border/5 p-3 bg-[#221F26]/60 hover:bg-[#2A2732]/60 transition-colors"
          >
            <div className="flex items-center space-x-3">
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
                    }
                  }}
                  className="border-primary/50 data-[state=checked]:bg-primary/70 data-[state=checked]:text-primary-foreground"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-white/80">
                  {service.name}
                </FormLabel>
              </div>
            </div>
            {isSelected && (
              <div className="pl-7">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={selectedItem?.unit_price || service.price || 0}
                  onChange={(e) => {
                    const newPrice = parseFloat(e.target.value)
                    const currentItems = field.value || []
                    const updatedItems = currentItems.map((item: ServiceItemType) =>
                      item.service_id === service.id
                        ? { ...item, unit_price: newPrice }
                        : item
                    )
                    field.onChange(updatedItems)
                  }}
                  className="w-32"
                  placeholder="Price"
                />
              </div>
            )}
          </FormItem>
        )}
      />
    </div>
  )
}