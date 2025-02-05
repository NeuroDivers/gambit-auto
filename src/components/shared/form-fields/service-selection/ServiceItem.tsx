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
  const serviceItems = field.value || []
  const isSelected = serviceItems.some(
    (item: any) => item.service_name === service.name
  )

  const selectedItem = serviceItems.find(
    (item: any) => item.service_name === service.name
  )

  return (
    <div className="space-y-2">
      <FormField
        control={form.control}
        name="quote_items"
        render={() => (
          <FormItem
            className="flex flex-col space-y-3 rounded-md border border-border/5 p-3 bg-[#221F26]/60 hover:bg-[#2A2732]/60 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <FormControl>
                <Checkbox
                  id={`service-${service.id}`}
                  checked={isSelected}
                  onCheckedChange={(checked) => {
                    const currentItems = field.value || []
                    if (checked) {
                      field.onChange([
                        ...currentItems,
                        {
                          service_name: service.name,
                          quantity: 1,
                          unit_price: service.price || 0
                        }
                      ])
                    } else {
                      field.onChange(
                        currentItems.filter(
                          (item: any) => item.service_name !== service.name
                        )
                      )
                    }
                  }}
                  className="border-primary/50 data-[state=checked]:bg-primary/70 data-[state=checked]:text-primary-foreground"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel htmlFor={`service-${service.id}`} className="text-white/80">
                  {service.name}
                </FormLabel>
              </div>
            </div>
            {isSelected && (
              <div className="pl-7 space-y-2">
                <Input
                  id={`quantity-${service.id}`}
                  type="number"
                  min="1"
                  value={selectedItem?.quantity || 1}
                  onChange={(e) => {
                    const quantity = parseInt(e.target.value)
                    const currentItems = field.value || []
                    const updatedItems = currentItems.map((item: any) =>
                      item.service_name === service.name
                        ? { ...item, quantity }
                        : item
                    )
                    field.onChange(updatedItems)
                  }}
                  className="w-32"
                  placeholder="Quantity"
                />
                <Input
                  id={`price-${service.id}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={selectedItem?.unit_price || service.price || 0}
                  onChange={(e) => {
                    const unit_price = parseFloat(e.target.value)
                    const currentItems = field.value || []
                    const updatedItems = currentItems.map((item: any) =>
                      item.service_name === service.name
                        ? { ...item, unit_price }
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