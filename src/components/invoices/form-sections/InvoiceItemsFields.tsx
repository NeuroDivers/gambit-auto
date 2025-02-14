
import { InvoiceItemsHeader } from "./invoice-items/InvoiceItemsHeader"
import { InvoiceItem } from "../types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField"

type InvoiceItemsFieldsProps = {
  items: InvoiceItem[]
  setItems: (items: InvoiceItem[]) => void
}

export function InvoiceItemsFields({ items, setItems }: InvoiceItemsFieldsProps) {
  return (
    <div className="space-y-4">
      <ServiceSelectionField 
        services={items}
        onServicesChange={setItems}
      />
    </div>
  )
}
