import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"

type InvoiceItem = {
  service_name: string
  description: string
  quantity: number
  unit_price: number
}

type InvoiceItemsFieldsProps = {
  items: InvoiceItem[]
  setItems: (items: InvoiceItem[]) => void
}

export function InvoiceItemsFields({ items, setItems }: InvoiceItemsFieldsProps) {
  const addItem = () => {
    setItems([
      ...items,
      {
        service_name: "",
        description: "",
        quantity: 1,
        unit_price: 0,
      },
    ])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items]
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    }
    setItems(newItems)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-lg">Invoice Items</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addItem}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      </div>

      <div className="space-y-6">
        {items.map((item, index) => (
          <div key={index} className="space-y-4 p-4 border rounded-lg relative">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => removeItem(index)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>

            <div className="grid gap-4">
              <div>
                <Label htmlFor={`service-name-${index}`}>Service Name</Label>
                <Input
                  id={`service-name-${index}`}
                  value={item.service_name}
                  onChange={(e) => updateItem(index, "service_name", e.target.value)}
                  placeholder="Enter service name"
                />
              </div>

              <div>
                <Label htmlFor={`description-${index}`}>Description</Label>
                <Textarea
                  id={`description-${index}`}
                  value={item.description}
                  onChange={(e) => updateItem(index, "description", e.target.value)}
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
                    onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value))}
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
                    onChange={(e) => updateItem(index, "unit_price", parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}