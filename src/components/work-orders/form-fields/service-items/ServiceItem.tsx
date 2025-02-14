
import React, { useEffect, useState } from "react"
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
  service: ServiceItemType
  onRemove: (index: number) => void
  onUpdate: (service: ServiceItemType) => void
}

export function ServiceItem({ index, service, onRemove, onUpdate }: ServiceItemProps) {
  const { data: services = [], isLoading } = useServiceData()
  const [isAccordionOpen, setIsAccordionOpen] = useState<string>("service-details")

  // Create organized options with clear group labels and sorted items
  const serviceOptions: Option[] = React.useMemo(() => {
    if (!services || services.length === 0) return []

    // Group services by hierarchy type for better organization
    const servicesByType = services.reduce((acc: { [key: string]: any[] }, service) => {
      const type = service.hierarchy_type || 'Other'
      if (!acc[type]) acc[type] = []
      acc[type].push({
        ...service,
        sortKey: service.name.toLowerCase()
      })
      return acc
    }, {})

    // Sort services within each group
    Object.keys(servicesByType).forEach(type => {
      servicesByType[type].sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    })

    return Object.entries(servicesByType)
      .sort(([a], [b]) => a.localeCompare(b))
      .flatMap(([type, services]) => [
        { 
          value: `group-${type}`, 
          label: type.toUpperCase(), 
          price: null, 
          disabled: true 
        },
        ...services.map(service => ({
          value: service.id,
          label: service.name,
          price: service.price,
        }))
      ])
  }, [services])

  const handleServiceChange = (serviceId: string) => {
    const selectedService = services?.find((s) => s.id === serviceId)
    if (!selectedService) return

    console.log("Updating service with:", selectedService)

    const updatedService = {
      ...service,
      service_id: selectedService.id,
      service_name: selectedService.name,
      unit_price: selectedService.price || 0,
      quantity: 1
    }
    
    console.log("Updated service:", updatedService)
    onUpdate(updatedService)
  }

  const handleQuantityChange = (quantity: number) => {
    if (isNaN(quantity) || quantity < 1) return
    onUpdate({
      ...service,
      quantity
    })
  }

  const handlePriceChange = (price: number) => {
    if (isNaN(price) || price < 0) return
    onUpdate({
      ...service,
      unit_price: price
    })
  }

  // Effect to automatically open accordion when service is selected
  useEffect(() => {
    if (service.service_id) {
      setIsAccordionOpen("service-details")
    }
  }, [service.service_id])

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

        <Accordion 
          type="single" 
          collapsible 
          className="w-full"
          value={isAccordionOpen}
          onValueChange={setIsAccordionOpen}
        >
          <AccordionItem value="service-details">
            <AccordionTrigger className="text-lg font-medium">
              {service.service_name || "Select a Service"}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <div>
                  <Label htmlFor={`service-type-${index}`}>Service Type</Label>
                  <SearchableSelect
                    options={serviceOptions}
                    value={service.service_id || ""}
                    onValueChange={handleServiceChange}
                    placeholder={isLoading ? "Loading services..." : "Search for a service..."}
                    showPrice={true}
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                    <Input
                      id={`quantity-${index}`}
                      name={`quantity-${index}`}
                      type="number"
                      min={1}
                      value={service.quantity || 1}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`unit-price-${index}`}>Unit Price</Label>
                    <Input
                      id={`unit-price-${index}`}
                      name={`unit-price-${index}`}
                      type="number"
                      min={0}
                      step="0.01"
                      value={service.unit_price || 0}
                      onChange={(e) => handlePriceChange(parseFloat(e.target.value))}
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
