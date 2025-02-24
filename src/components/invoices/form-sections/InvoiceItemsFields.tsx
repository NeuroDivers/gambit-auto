import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { InvoiceItem } from "../types"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField"
import { ServiceItemType } from "@/hooks/quote-request/formSchema"

export interface InvoiceItemsFieldsProps {
  items: InvoiceItem[]
  setItems: (items: InvoiceItem[]) => void
  allowPriceEdit?: boolean
  showCommission?: boolean
}

export function InvoiceItemsFields({ items, setItems, allowPriceEdit = false, showCommission = false }: InvoiceItemsFieldsProps) {
  const handleServiceChange = (services: ServiceItemType[]) => {
    const invoiceItems: InvoiceItem[] = services.map(service => ({
      service_id: service.service_id,
      service_name: service.service_name,
      quantity: service.quantity,
      unit_price: service.unit_price,
      commission_rate: service.commission_rate,
      commission_type: service.commission_type,
      description: service.description || ""
    }))
    setItems(invoiceItems)
  }

  const handleQuantityChange = (index: number, value: string) => {
    const newItems = [...items]
    newItems[index] = {
      ...newItems[index],
      quantity: parseInt(value) || 1
    }
    setItems(newItems)
  }

  const handlePriceChange = (index: number, value: string) => {
    const newItems = [...items]
    newItems[index] = {
      ...newItems[index],
      unit_price: parseFloat(value) || 0
    }
    setItems(newItems)
  }

  const handleDeleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <ServiceSelectionField 
        services={items.map(item => ({
          ...item,
          commission_rate: item.commission_rate ?? null,
          commission_type: item.commission_type ?? null
        }))}
        onServicesChange={handleServiceChange}
        allowPriceEdit={allowPriceEdit}
        showCommission={showCommission}
      />

      {items?.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[100px] text-right">Quantity</TableHead>
              <TableHead className="w-[120px] text-right">Unit Price</TableHead>
              <TableHead className="w-[120px] text-right">Total</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.service_name}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                    className="w-[80px] ml-auto text-right"
                  />
                </TableCell>
                <TableCell className="text-right">
                  {allowPriceEdit ? (
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => handlePriceChange(index, e.target.value)}
                      className="w-[100px] ml-auto text-right"
                    />
                  ) : (
                    `$${item.unit_price.toFixed(2)}`
                  )}
                </TableCell>
                <TableCell className="text-right">
                  ${(item.quantity * item.unit_price).toFixed(2)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
