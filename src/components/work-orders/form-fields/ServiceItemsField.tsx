import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"
import { WorkOrderFormValues } from "../WorkOrderFormFields"

type ServiceItemsFieldProps = {
  form: UseFormReturn<WorkOrderFormValues>
}

type ServiceType = {
  id: string
  name: string
  price: number | null
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
      form.setValue("service_items", [
        ...currentServices,
        {
          service_id: service.id,
          service_name: service.name,
          quantity: 1,
          unit_price: service.price || 0
        }
      ])
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
                {/* Available Services */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services
                    .filter(service => !selectedServices.find(s => s.service_id === service.id))
                    .map((service) => (
                      <Button
                        key={service.id}
                        type="button"
                        variant="outline"
                        className="justify-start h-auto py-3 px-4"
                        onClick={() => handleAddService(service)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        <div className="text-left">
                          <div className="font-medium">{service.name}</div>
                          {service.price && (
                            <div className="text-sm text-primary/70">
                              ${service.price}
                            </div>
                          )}
                        </div>
                      </Button>
                    ))}
                </div>

                {/* Selected Services */}
                <div className="space-y-4">
                  {selectedServices.map((service, index) => (
                    <div
                      key={service.service_id}
                      className="flex items-center gap-4 bg-[#221F26]/60 p-4 rounded-md"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-white/90">{service.service_name}</div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Input
                          type="number"
                          value={service.quantity}
                          onChange={(e) => updateQuantity(index, parseInt(e.target.value))}
                          className="w-20"
                          min={1}
                        />
                        <Input
                          type="number"
                          value={service.unit_price}
                          onChange={(e) => updateUnitPrice(index, parseFloat(e.target.value))}
                          className="w-24"
                          min={0}
                          step={0.01}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveService(service.service_id)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
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