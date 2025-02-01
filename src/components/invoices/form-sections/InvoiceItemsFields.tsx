import { InvoiceItemForm } from "./invoice-items/InvoiceItemForm"
import { InvoiceItemsHeader } from "./invoice-items/InvoiceItemsHeader"
import { InvoiceItem } from "../types"

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
      <InvoiceItemsHeader onAddItem={addItem} />
      <div className="space-y-6">
        {items.map((item, index) => (
          <InvoiceItemForm
            key={index}
            item={item}
            index={index}
            onUpdate={updateItem}
            onRemove={removeItem}
          />
        ))}
      </div>
    </div>
  )
}