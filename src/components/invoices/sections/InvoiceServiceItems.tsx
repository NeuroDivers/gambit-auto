
import { InvoiceItemsFields } from "../form-sections/InvoiceItemsFields"
import { UseFormReturn } from "react-hook-form"
import { InvoiceFormValues } from "../types"

type InvoiceServiceItemsProps = {
  form: UseFormReturn<InvoiceFormValues>
}

export function InvoiceServiceItems({ form }: InvoiceServiceItemsProps) {
  return (
    <InvoiceItemsFields
      items={form.watch('invoice_items')}
      setItems={(items) => form.setValue('invoice_items', items)}
    />
  )
}
