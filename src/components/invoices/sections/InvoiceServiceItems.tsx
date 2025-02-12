
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { InvoiceItem } from "../types"
import { ServiceItemForm } from "../form-sections/invoice-items/ServiceItemForm"
import { useServiceData } from "@/components/shared/form-fields/service-selection/useServiceData"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"

type InvoiceServiceItemsProps = {
  items: InvoiceItem[]
  setItems?: (items: InvoiceItem[]) => void
}

export function InvoiceServiceItems({ items, setItems }: InvoiceServiceItemsProps) {
  const { data: services = [] } = useServiceData()

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

  return (
    <ScrollArea className="h-[calc(100vh-20rem)]">
      <Card className="border-border/5 bg-card">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-foreground">Services</h2>
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
                onRemove={() => handleRemoveItem(index)}
                readOnly={!setItems}
              />
            ))}
            {items.length === 0 && (
              <p className="text-muted-foreground">No services added</p>
            )}
          </div>
        </CardContent>
      </Card>
    </ScrollArea>
  )
}
