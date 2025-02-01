import { formatCurrency } from '@/lib/utils'

type InvoiceTotalsProps = {
  subtotal: number
  taxAmount: number
  total: number
}

export function InvoiceTotals({ subtotal, taxAmount, total }: InvoiceTotalsProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 items-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-[#8E9196]">
            <span>Sous-total / Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-[#8E9196]">
            <span>Taxes / Taxes</span>
            <span>{formatCurrency(taxAmount)}</span>
          </div>
          <div className="flex justify-between font-bold text-[#1A1F2C] pt-2 border-t border-[#F1F0FB]">
            <span>Total / Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}