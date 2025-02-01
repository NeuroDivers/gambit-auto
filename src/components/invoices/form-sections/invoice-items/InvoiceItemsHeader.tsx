import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"

type InvoiceItemsHeaderProps = {
  onAddItem: () => void
}

export function InvoiceItemsHeader({ onAddItem }: InvoiceItemsHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <Label className="text-lg">Invoice Items</Label>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onAddItem}
        className="flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Item
      </Button>
    </div>
  )
}