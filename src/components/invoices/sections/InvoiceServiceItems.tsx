import { formatCurrency } from "@/lib/utils"
import { InvoiceItem } from "../types"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useServiceData } from "@/components/shared/form-fields/service-selection/useServiceData"
import { Label } from "@/components/ui/label"

type InvoiceServiceItemsProps = {
  items: InvoiceItem[]
  setItems?: (items: InvoiceItem[]) => void
}

export function InvoiceServiceItems({ items, setItems }: InvoiceServiceItemsProps) {
  const { data: services } = useServiceData()

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

  const handleServiceSelect = (index: number, serviceName: string) => {
    if (setItems) {
      const selectedService = services?.find(service => service.name === serviceName)
      const updatedItems = [...items]
      updatedItems[index] = {
        ...updatedItems[index],
        service_name: serviceName,
        unit_price: selectedService?.price || 0
      }
      setItems(updatedItems)
    }
  }

  // Only show "No services added" if items is undefined or empty
  if (!items || items.length === 0) {
    return (
      <div className="pt-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-white/90">Services / Services</h2>
          {setItems && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Item
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
        <h2 className="font-semibold text-white/90">Services / Services</h2>
        {setItems && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddItem}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </Button>
        )}
      </div>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="relative border rounded-lg p-4 space-y-4">
            {setItems && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveItem(index)}
                className="absolute top-2 right-2"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <div className="space-y-4">
              <div>
                <Label>Service</Label>
                {setItems ? (
                  <Select
                    value={item.service_name}
                    onValueChange={(value) => handleServiceSelect(index, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services?.map((service) => (
                        <SelectItem key={service.id} value={service.name}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="py-2">{item.service_name}</div>
                )}
              </div>
              <div>
                <Label>Description</Label>
                {setItems ? (
                  <Textarea
                    value={item.description}
                    onChange={(e) => handleUpdateItem(index, "description", e.target.value)}
                    placeholder="Enter description"
                  />
                ) : (
                  <div className="py-2">{item.description}</div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Quantity</Label>
                  {setItems ? (
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleUpdateItem(index, "quantity", parseInt(e.target.value))}
                    />
                  ) : (
                    <div className="py-2">{item.quantity}</div>
                  )}
                </div>
                <div>
                  <Label>Unit Price</Label>
                  {setItems ? (
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => handleUpdateItem(index, "unit_price", parseFloat(e.target.value))}
                    />
                  ) : (
                    <div className="py-2">{formatCurrency(item.unit_price)}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}