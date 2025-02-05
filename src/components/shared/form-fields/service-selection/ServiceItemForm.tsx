import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ServiceItemType } from "@/components/work-orders/types"
import { Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"

type ServiceItemFormProps = {
  index: number
  item: ServiceItemType
  services: Array<{
    id: string
    name: string
    price: number | null
  }>
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
        className="absolute top-2 right-2"
        onClick={onRemove}
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      <div className="grid gap-4">
        <div>
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Quantity</Label>
            <Input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => onUpdate(index, "quantity", parseInt(e.target.value))}
            />
          </div>
          <div>
            <Label>Unit Price</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={item.unit_price}
              onChange={(e) => onUpdate(index, "unit_price", parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>
    </div>
  )
}