import { Tables } from "@/integrations/supabase/types"

type InvoiceTaxInfoProps = {
  taxes?: Tables<'business_taxes'>[] | null
  subtotal: number
}

export function InvoiceTaxInfo({ taxes, subtotal }: InvoiceTaxInfoProps) {
  const gstTax = taxes?.find(tax => tax.tax_type === 'GST')
  const qstTax = taxes?.find(tax => tax.tax_type === 'QST')
  
  const gstAmount = gstTax ? (subtotal * gstTax.tax_rate) / 100 : 0
  const qstAmount = qstTax ? (subtotal * qstTax.tax_rate) / 100 : 0
  const total = subtotal + gstAmount + qstAmount

  return (
    <div className="w-64 space-y-2">
      <div className="flex justify-between text-gray-600">
        <span>Sous-total / Subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      {gstTax && (
        <div className="flex justify-between text-gray-600">
          <span>TPS/GST ({gstTax.tax_rate}%)</span>
          <span>${gstAmount.toFixed(2)}</span>
        </div>
      )}
      {qstTax && (
        <div className="flex justify-between text-gray-600">
          <span>TVQ/QST ({qstTax.tax_rate.toFixed(3)}%)</span>
          <span>${qstAmount.toFixed(2)}</span>
        </div>
      )}
      <div className="flex justify-between font-bold pt-2 border-t text-black">
        <span>Total / Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
      <div className="text-xs text-gray-500 space-y-1 pt-2">
        {gstTax && <p>TPS/GST No: {gstTax.tax_number}</p>}
        {qstTax && <p>TVQ/QST No: {qstTax.tax_number}</p>}
      </div>
    </div>
  )
}