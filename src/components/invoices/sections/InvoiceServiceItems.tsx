
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InvoiceItemsFields } from "../form-sections/InvoiceItemsFields"
import { UseFormReturn } from "react-hook-form"
import { InvoiceFormValues, InvoiceItem } from "../types"
import { InvoiceTaxSummary } from "../form-sections/InvoiceTaxSummary"
import { ClipboardListIcon } from "lucide-react"

type InvoiceServiceItemsProps = {
  form?: UseFormReturn<InvoiceFormValues>;
  items?: InvoiceItem[];
  setItems?: (items: InvoiceItem[] | any[]) => void;
  allowPriceEdit?: boolean;
  invoiceId?: string;
}

export function InvoiceServiceItems({ 
  form, 
  items: propItems, 
  setItems: propSetItems, 
  allowPriceEdit = true,
  invoiceId 
}: InvoiceServiceItemsProps) {
  
  // If form is provided, use it to manage state
  const items = form ? form.watch('invoice_items') : propItems || [];
  
  const handleTotalCalculated = (subtotal: number, gst: number, qst: number, total: number) => {
    if (form) {
      form.setValue('subtotal', subtotal)
      form.setValue('gst_amount', gst)
      form.setValue('qst_amount', qst)
      form.setValue('total', total)
    }
  }

  const handleItemsChange = (updatedItems: InvoiceItem[] | any[]) => {
    if (form) {
      // Ensure we're setting the correct type (InvoiceItem[])
      form.setValue('invoice_items', updatedItems as InvoiceItem[]);
    } else if (propSetItems) {
      propSetItems(updatedItems);
    }
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
            items={items}
            setItems={handleItemsChange}
            allowPriceEdit={allowPriceEdit}
            invoiceId={invoiceId}
          />
        </CardContent>
      </Card>

      <InvoiceTaxSummary 
        items={items} 
        onTotalCalculated={handleTotalCalculated}
      />
    </div>
  )
}
