
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InvoiceItemsFields } from "../form-sections/InvoiceItemsFields"
import { UseFormReturn } from "react-hook-form"
import { InvoiceFormValues } from "../types"

type InvoiceServiceItemsProps = {
  form: UseFormReturn<InvoiceFormValues>
}

export function InvoiceServiceItems({ form }: InvoiceServiceItemsProps) {
  return (
    <Card className="border-border/5">
      <CardHeader>
        <CardTitle>Service Items</CardTitle>
      </CardHeader>
      <CardContent>
        <InvoiceItemsFields
          items={form.watch('invoice_items')}
          setItems={(items) => form.setValue('invoice_items', items)}
        />
      </CardContent>
    </Card>
  )
}
