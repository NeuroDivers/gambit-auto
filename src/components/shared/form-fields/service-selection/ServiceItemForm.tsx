import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import { ServiceItemType } from "@/components/work-orders/types"

interface ServiceItemFormProps {
  index: number
  item: ServiceItemType
  services: any[]
  onUpdate: (index: number, field: keyof ServiceItemType, value: any) => void
  onRemove: () => void
}

export function ServiceItemForm({ index, item, services, onUpdate, onRemove }: ServiceItemFormProps) {
  const handleServiceSelect = (serviceId: string) => {
    const selectedService = services.find(service => service.id === serviceId)
    if (selectedService) {
      onUpdate(index, "service_id", serviceId)
      onUpdate(index, "service_name", selectedService.name)
      onUpdate(index, "unit_price", selectedService.price || 0)
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="absolute right-2 top-2"
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Service</Label>
          <Select
            value={item.service_id}
            onValueChange={handleServiceSelect}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Quantity</Label>
          <Input
            type="number"
            value={item.quantity}
            onChange={(e) => onUpdate(index, "quantity", parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-2">
          <Label>Unit Price</Label>
          <Input
            type="number"
            value={item.unit_price}
            onChange={(e) => onUpdate(index, "unit_price", parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>
    </div>
  )
}