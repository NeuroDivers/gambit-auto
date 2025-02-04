import { formatCurrency } from "@/lib/utils"
import { InvoiceItem } from "../types"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

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
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#F1F0FB]">
            <th className="py-2 text-left text-[#8E9196] font-medium">Service / Service</th>
            <th className="py-2 text-left text-[#8E9196] font-medium">Description / Description</th>
            <th className="py-2 text-right text-[#8E9196] font-medium">Quantité / Quantity</th>
            <th className="py-2 text-right text-[#8E9196] font-medium">Prix unitaire / Unit Price</th>
            <th className="py-2 text-right text-[#8E9196] font-medium">Montant / Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-b border-[#F1F0FB]">
              <td className="py-3 text-white/90">{item.service_name}</td>
              <td className="py-3 text-white/90">{item.description}</td>
              <td className="py-3 text-right text-white/90">{item.quantity}</td>
              <td className="py-3 text-right text-white/90">{formatCurrency(item.unit_price)}</td>
              <td className="py-3 text-right text-white/90">{formatCurrency(item.quantity * item.unit_price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}