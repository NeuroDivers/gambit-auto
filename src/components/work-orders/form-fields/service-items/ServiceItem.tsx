
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useServiceData } from "@/components/shared/form-fields/service-selection/useServiceData"
import { ServiceItemType } from "../../types"
import { SearchableSelect, Option } from "@/components/shared/form-fields/searchable-select/SearchableSelect"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface ServiceItemProps {
  index: number
  field: { value: ServiceItemType }
  form: {
    getValues: () => ServiceItemType[]
    setValue: (name: string, value: ServiceItemType[]) => void
  }
  onRemove: (index: number) => void
}

export function ServiceItem({ index, field, form, onRemove }: ServiceItemProps) {
  const { data: services = [] } = useServiceData()

  // Group services by type for better organization
  const servicesByType = services.reduce((acc: { [key: string]: any[] }, service) => {
    const type = service.service_type || 'Other'
    if (!acc[type]) acc[type] = []
    acc[type].push(service)
    return acc
  }, {})

  const handleServiceChange = (serviceId: string) => {
    const selectedService = services.find((s) => s.id === serviceId)
    if (!selectedService) return

    const currentServices = form.getValues()
    const updatedServices = [...currentServices]
    updatedServices[index] = {
      ...updatedServices[index],
      service_id: selectedService.id,
      service_name: selectedService.name,
      unit_price: selectedService.price || 0
    }
    form.setValue("service_items", updatedServices)
  }

  const handleQuantityChange = (quantity: number) => {
    const currentServices = form.getValues()
    const updatedServices = [...currentServices]
    updatedServices[index] = {
      ...updatedServices[index],
      quantity
    }
    form.setValue("service_items", updatedServices)
  }

  const handlePriceChange = (price: number) => {
    const currentServices = form.getValues()
    const updatedServices = [...currentServices]
    updatedServices[index] = {
      ...updatedServices[index],
      unit_price: price
    }
    form.setValue("service_items", updatedServices)
  }

  // Create grouped options for the select
  const serviceOptions: Option[] = Object.entries(servicesByType).map(([type, services]) => ({
    label: type,
    options: services.map(service => ({
      value: service.id,
      label: service.name,
      price: service.price,
    }))
  }));

  return (
    <Card className="relative">
      <CardContent className="p-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(index)}
          className="absolute top-2 right-2"
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="service-details">
            <AccordionTrigger className="text-lg font-medium">
              {field.value.service_name || "Select a Service"}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>Service Type</Label>
                  <SearchableSelect
                    options={serviceOptions}
                    value={field.value.service_id}
                    onValueChange={handleServiceChange}
                    placeholder="Select a service"
                    showPrice={true}
                    renderOption={(option) => (
                      <div className="flex justify-between items-center w-full">
                        <span>{option.label}</span>
                        {option.price && (
                          <span className="text-sm text-muted-foreground">
                            ${option.price}
                          </span>
                        )}
                      </div>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min={1}
                      value={field.value.quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Unit Price</Label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={field.value.unit_price}
                      onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}
