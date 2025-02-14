
import { ServiceItemType } from "@/components/work-orders/types"
import { ServiceDropdown } from "./ServiceDropdown"
import { ServiceQuantityPrice } from "./ServiceQuantityPrice"
import { ServiceDescription } from "./ServiceDescription"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"

interface ServiceItemFormProps {
  index: number
  item: ServiceItemType
  services: Array<{
    id: string
    name: string
    description?: string
    price?: number
    hierarchy_type?: string
    requires_main_service?: boolean
  }>
  onUpdate: (index: number, field: keyof ServiceItemType, value: any) => void
  onRemove: () => void
}

export function ServiceItemForm({
  index,
  item,
  services,
  onUpdate,
  onRemove,
}: ServiceItemFormProps) {
  const [open, setOpen] = useState(false)

  const handleServiceSelect = (serviceId: string) => {
    const selectedService = services.find((s) => s.id === serviceId)
    if (selectedService) {
      console.log("Selected service:", selectedService)
      onUpdate(index, "service_id", selectedService.id)
      onUpdate(index, "service_name", selectedService.name)
      onUpdate(index, "unit_price", selectedService.price || 0)
      
      // Reset main_service_id if this is not a sub-service
      if (selectedService.hierarchy_type !== 'sub') {
        onUpdate(index, "main_service_id", null)
      }
    }
    setOpen(false)
  }

  // Group services by type for better organization
  const servicesByType = services.reduce((acc: { [key: string]: typeof services }, service) => {
    const type = service.hierarchy_type === 'sub' ? 'Sub Services' : 'Main Services'
    if (!acc[type]) acc[type] = []
    acc[type].push(service)
    return acc
  }, {})

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <ServiceDropdown
              selectedServiceName={item.service_name || "Select a service..."}
              servicesByType={servicesByType}
              open={open}
              setOpen={setOpen}
              handleServiceSelect={handleServiceSelect}
              serviceId={item.service_id}
            />
            {item.service_id && (
              <ServiceDescription
                description={
                  services.find((s) => s.id === item.service_id)?.description
                }
              />
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="ml-2"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <ServiceQuantityPrice
          quantity={item.quantity}
          unitPrice={item.unit_price}
          onQuantityChange={(value) => onUpdate(index, "quantity", value)}
          onUnitPriceChange={(value) => onUpdate(index, "unit_price", value)}
        />
      </CardContent>
    </Card>
  )
}
