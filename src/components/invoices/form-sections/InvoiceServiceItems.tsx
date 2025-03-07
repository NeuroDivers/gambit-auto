import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InvoiceItemsFields } from "../form-sections/InvoiceItemsFields"
import { UseFormReturn } from "react-hook-form"
import { InvoiceFormValues, InvoiceItem } from "../types"
import { InvoiceTaxSummary } from "../form-sections/InvoiceTaxSummary"
import { ServiceItemType } from "@/types/service-item"

type InvoiceServiceItemsProps = {
  form?: UseFormReturn<InvoiceFormValues>;
  invoiceId?: string;
  items?: InvoiceItem[];
  setItems?: (items: InvoiceItem[] | any[]) => void;
  allowPriceEdit?: boolean;
}

export function InvoiceServiceItems({ form, invoiceId, items, setItems, allowPriceEdit }: InvoiceServiceItemsProps) {
  // If form is provided, use React Hook Form pattern
  if (form) {
    const handleTotalCalculated = (subtotal: number, gst: number, qst: number, total: number) => {
      form.setValue('subtotal', subtotal);
      form.setValue('gst_amount', gst);
      form.setValue('qst_amount', qst);
      form.setValue('total', total);
    };

    const handleItemsChange = (newItems: InvoiceItem[] | ServiceItemType[]) => {
      // Ensure we're setting the correct type (InvoiceItem[])
      const invoiceItems = newItems.map(item => ({
        service_id: item.service_id,
        service_name: item.service_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        description: item.description || "",
        commission_rate: (item as any).commission_rate,
        commission_type: (item as any).commission_type,
        package_id: (item as any).package_id
      }));
      
      form.setValue('invoice_items', invoiceItems as InvoiceItem[]);
    };

    return (
      <div className="space-y-4">
        <Card className="border-border/5">
          <CardHeader>
            <CardTitle>Service Items</CardTitle>
          </CardHeader>
          <CardContent>
            <InvoiceItemsFields
              items={form.watch('invoice_items')}
              setItems={handleItemsChange}
              allowPriceEdit={allowPriceEdit || true}
            />
          </CardContent>
        </Card>

        <InvoiceTaxSummary 
          items={form.watch('invoice_items')} 
          onTotalCalculated={handleTotalCalculated}
        />
      </div>
    );
  }
  
  // Otherwise use the directly provided items
  return (
    <div className="space-y-4">
      <Card className="border-border/5">
        <CardHeader>
          <CardTitle>Service Items</CardTitle>
        </CardHeader>
        <CardContent>
          {items && setItems && (
            <InvoiceItemsFields
              items={items}
              setItems={setItems}
              allowPriceEdit={allowPriceEdit || true}
              invoiceId={invoiceId}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
