import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import type { WorkOrderFormValues } from "../WorkOrderFormFields"
import { ServiceList } from "./service-items/ServiceList"
import { ServiceItem } from "./service-items/ServiceItem"
import type { ServiceType, ServiceItemType } from "./service-items/types"

type ServiceItemsFieldProps = {
  form: UseFormReturn<WorkOrderFormValues>
}

export function ServiceItemsField({ form }: ServiceItemsFieldProps) {
  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("id, name, price")
        .eq("status", "active")
      
      if (error) throw error
      return data as ServiceType[]
    }
  })

  const selectedServices = form.watch("service_items") || []

  const handleAddService = (service: ServiceType) => {
    const currentServices = form.getValues("service_items") || []
    if (!currentServices.find(s => s.service_id === service.id)) {
      const newService: ServiceItemType = {
        service_id: service.id,
        service_name: service.name,
        quantity: 1,
        unit_price: service.price || 0
      }
      form.setValue("service_items", [...currentServices, newService])
    }
  }

  const handleRemoveService = (serviceId: string) => {
    const currentServices = form.getValues("service_items") || []
    form.setValue(
      "service_items",
      currentServices.filter(s => s.service_id !== serviceId)
    )
  }

  const updateQuantity = (index: number, value: number) => {
    const currentServices = [...(form.getValues("service_items") || [])]
    currentServices[index] = {
      ...currentServices[index],
      quantity: value
    }
    form.setValue("service_items", currentServices)
  }

  const updateUnitPrice = (index: number, value: number) => {
    const currentServices = [...(form.getValues("service_items") || [])]
    currentServices[index] = {
      ...currentServices[index],
      unit_price: value
    }
    form.setValue("service_items", currentServices)
  }

  return (
    <FormField
      control={form.control}
      name="service_items"
      render={() => (
        <FormItem>
          <Card className="border-border/5 bg-[#1A1F2C]/80">
            <CardContent className="p-4">
              <FormLabel className="text-lg font-semibold mb-4 block text-white/90">Services</FormLabel>
              
              <div className="space-y-4">
                <ServiceList 
                  services={services}
                  selectedServiceIds={selectedServices.map(s => s.service_id)}
                  onAddService={handleAddService}
                />

                <div className="space-y-4">
                  {selectedServices.map((service, index) => (
                    <ServiceItem
                      key={service.service_id}
                      service={service}
                      onQuantityChange={(value) => updateQuantity(index, value)}
                      onUnitPriceChange={(value) => updateUnitPrice(index, value)}
                      onRemove={() => handleRemoveService(service.service_id)}
                    />
                  ))}
                </div>
              </div>
              
              <FormMessage />
            </CardContent>
          </Card>
        </FormItem>
      )}
    />
  )
}