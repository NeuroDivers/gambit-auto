
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InvoiceItemsFields } from "../form-sections/InvoiceItemsFields"
import { UseFormReturn } from "react-hook-form"
import { InvoiceFormValues } from "../types"
import { InvoiceTaxSummary } from "../form-sections/InvoiceTaxSummary"

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

  return (
    <div className="space-y-4">
      <Card className="border-border/5">
        <CardHeader>
          <CardTitle>Service Items</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceItemsFields
            items={form.watch('invoice_items')}
            setItems={(items) => form.setValue('invoice_items', items)}
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
