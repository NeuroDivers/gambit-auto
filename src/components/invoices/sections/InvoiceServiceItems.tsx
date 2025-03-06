
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InvoiceItemsFields } from "../form-sections/InvoiceItemsFields"
import { UseFormReturn } from "react-hook-form"
import { InvoiceFormValues, InvoiceItem } from "../types"
import { InvoiceTaxSummary } from "../form-sections/InvoiceTaxSummary"
import { ClipboardListIcon } from "lucide-react"

type InvoiceServiceItemsProps = {
  form: UseFormReturn<InvoiceFormValues>
}

export function InvoiceServiceItems({ form }: InvoiceServiceItemsProps) {
  const handleTotalCalculated = (subtotal: number, gst: number, qst: number, total: number) => {
    form.setValue('subtotal', subtotal)
    form.setValue('gst_amount', gst)
    form.setValue('qst_amount', qst)
    form.setValue('total', total)
  }

  const handleItemsChange = (items: InvoiceItem[] | any[]) => {
    // Ensure we're setting the correct type (InvoiceItem[])
    form.setValue('invoice_items', items as InvoiceItem[]);
  };

  return (
    <div className="space-y-4">
      <Card className="border-border/5 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/40 border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <ClipboardListIcon className="h-5 w-5 text-primary" />
            <CardTitle>Service Items</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <InvoiceItemsFields
            items={form.watch('invoice_items')}
            setItems={handleItemsChange}
            allowPriceEdit={true}
          />
        </CardContent>
      </Card>

      <InvoiceTaxSummary 
        items={form.watch('invoice_items')} 
        onTotalCalculated={handleTotalCalculated}
      />
    </div>
  )
}
