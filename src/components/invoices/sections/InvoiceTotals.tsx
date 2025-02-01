import { formatCurrency } from "@/lib/utils";

type InvoiceTotalsProps = {
  subtotal: number;
  taxAmount: number;
  total: number;
}

export function InvoiceTotals({ subtotal, taxAmount, total }: InvoiceTotalsProps) {
  return (
    <div className="border-t pt-4">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax</span>
          <span>{formatCurrency(taxAmount)}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}