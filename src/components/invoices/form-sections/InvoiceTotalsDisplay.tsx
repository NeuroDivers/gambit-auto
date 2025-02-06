import { Tables } from "@/integrations/supabase/types"
import { InvoiceItem } from "../types"

type InvoiceTotalsDisplayProps = {
  items: InvoiceItem[]
  taxes?: Tables<'business_taxes'>[] | null
}

export function InvoiceTotalsDisplay({ items, taxes }: InvoiceTotalsDisplayProps) {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
  
  const gstTax = taxes?.find(tax => tax.tax_type === 'GST')
  const qstTax = taxes?.find(tax => tax.tax_type === 'QST')
  
  const gstAmount = gstTax ? (subtotal * gstTax.tax_rate) / 100 : 0
  const qstAmount = qstTax ? (subtotal * qstTax.tax_rate) / 100 : 0
  const total = subtotal + gstAmount + qstAmount

  return (
    <div className="space-y-2 text-right">
      <div className="text-sm text-muted-foreground">
        <span>Subtotal:</span>
        <span className="ml-2">${subtotal.toFixed(2)}</span>
      </div>
      {gstTax && (
        <div className="text-sm text-muted-foreground">
          <span>GST ({gstTax.tax_rate}%):</span>
          <span className="ml-2">${gstAmount.toFixed(2)}</span>
        </div>
      )}
      {qstTax && (
        <div className="text-sm text-muted-foreground">
          <span>QST ({qstTax.tax_rate}%):</span>
          <span className="ml-2">${qstAmount.toFixed(2)}</span>
        </div>
      )}
      <div className="text-lg font-semibold">
        <span>Total:</span>
        <span className="ml-2">${total.toFixed(2)}</span>
      </div>
    </div>
  )
}