
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ServiceItemForm } from "./service-selection/ServiceItemForm"
import { useServiceData } from "./service-selection/useServiceData"
import { ServiceItemType } from "@/components/work-orders/types"
import { ScrollArea } from "@/components/ui/scroll-area"

type ServiceSelectionFieldProps = {
  form: UseFormReturn<any>
}

export function ServiceSelectionField({ form }: ServiceSelectionFieldProps) {
  const { data: services = [] } = useServiceData()
  const serviceItems = form.watch("service_items") || []

  const handleAddService = () => {
    const currentItems = form.getValues("service_items") || []
    form.setValue("service_items", [
      ...currentItems,
      {
        service_id: "",
        service_name: "",
        quantity: 1,
        unit_price: 0
      }
    ], { shouldValidate: true })
  }

  const handleRemoveService = (index: number) => {
    const currentItems = form.getValues("service_items") || []
    const newItems = [...currentItems]
    newItems.splice(index, 1)
    form.setValue("service_items", newItems, { shouldValidate: true })
  }

  const handleServiceUpdate = (index: number, field: keyof ServiceItemType, value: any) => {
    const currentItems = form.getValues("service_items") || []
    const newItems = [...currentItems]
    
    if (field === "service_id" && value) {
      const selectedService = services.find(s => s.id === value)
      if (selectedService) {
        newItems[index] = {
          ...newItems[index],
          service_id: selectedService.id,
          service_name: selectedService.name,
          unit_price: selectedService.price || 0
        }
      }
    } else {
      newItems[index] = {
        ...newItems[index],
        [field]: value
      }
    }
    
    form.setValue("service_items", newItems, { shouldValidate: true })
  }

  return (
    <FormField
      control={form.control}
      name="service_items"
      render={({ field }) => (
        <FormItem>
          <ScrollArea className="h-[calc(100vh-20rem)]">
            <Card className="border-border/5 bg-[#1A1F2C]/80">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <FormLabel htmlFor="service_items_list" className="text-lg font-semibold text-white/90">
                    Services
                  </FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddService}
                    className="flex items-center gap-2"
                    id="add_service_button"
                    name="add_service"
                  >
                    <Plus className="w-4 h-4" />
                    Add Service
                  </Button>
                </div>
                
                <div 
                  className="space-y-4"
                  id="service_items_list"
                  role="list"
                  aria-label="Service items list"
                >
                  {serviceItems.map((item: ServiceItemType, index: number) => (
                    <ServiceItemForm
                      key={index}
                      index={index}
                      item={item}
                      services={services}
                      onUpdate={handleServiceUpdate}
                      onRemove={() => handleRemoveService(index)}
                    />
                  ))}
                  {serviceItems.length === 0 && (
                    <p className="text-muted-foreground">No services added</p>
                  )}
                </div>
                <FormMessage />
              </CardContent>
            </Card>
          </ScrollArea>
        </FormItem>
      )}
    />
  )
}
