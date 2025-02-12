
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { InvoiceItem } from "../types"
import { ServiceItemForm } from "./service-items/ServiceItemForm"

type InvoiceServiceItemsProps = {
  items: InvoiceItem[]
  setItems?: (items: InvoiceItem[]) => void
}

export function InvoiceServiceItems({ items, setItems }: InvoiceServiceItemsProps) {
  const handleAddItem = () => {
    if (setItems) {
      setItems([
        ...items,
        {
          service_name: "",
          description: "",
          quantity: 1,
          unit_price: 0
        }
      ])
    }
  }

  const handleRemoveItem = (index: number) => {
    if (setItems) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const handleUpdateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    if (setItems) {
      const updatedItems = [...items]
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value
      }
      setItems(updatedItems)
    }
  }

  if (!items || items.length === 0) {
    return (
      <div className="pt-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-white/90">Services</h2>
          {setItems && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Service
            </Button>
          )}
        </div>
        <p className="text-[#8E9196]">No services added</p>
      </div>
    )
  }

  return (
    <div className="pt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-white/90">Services</h2>
        {setItems && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddItem}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Service
          </Button>
        )}
      </div>
      <div className="space-y-4">
        {items.map((item, index) => (
          <ServiceItemForm
            key={index}
            item={item}
            index={index}
            onUpdate={handleUpdateItem}
            onRemove={handleRemoveItem}
            readOnly={!setItems}
          />
        ))}
      </div>
    </div>
  )
}
