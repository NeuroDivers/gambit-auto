import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Trash2 } from "lucide-react"
import { InvoiceItem } from "../../types"

type InvoiceItemFormProps = {
  item: InvoiceItem
  index: number
  onUpdate: (index: number, field: keyof InvoiceItem, value: string | number) => void
  onRemove: (index: number) => void
}

export function InvoiceItemForm({ item, index, onUpdate, onRemove }: InvoiceItemFormProps) {
  return (
    <div className="space-y-4 p-4 border rounded-lg relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2"
        onClick={() => onRemove(index)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      <div className="grid gap-4">
        <div>
          <Label htmlFor={`service-name-${index}`}>Service Name</Label>
          <Input
            id={`service-name-${index}`}
            value={item.service_name}
            onChange={(e) => onUpdate(index, "service_name", e.target.value)}
            placeholder="Enter service name"
          />
        </div>

        <div>
          <Label htmlFor={`description-${index}`}>Description</Label>
          <Textarea
            id={`description-${index}`}
            value={item.description}
            onChange={(e) => onUpdate(index, "description", e.target.value)}
            placeholder="Enter description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`quantity-${index}`}>Quantity</Label>
            <Input
              id={`quantity-${index}`}
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => onUpdate(index, "quantity", parseInt(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor={`unit-price-${index}`}>Unit Price</Label>
            <Input
              id={`unit-price-${index}`}
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