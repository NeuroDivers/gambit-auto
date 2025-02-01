import { formatCurrency } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type InvoiceTotalsProps = {
  subtotal: number;
  taxAmount: number;
  total: number;
}

export function InvoiceTotals({ subtotal, taxAmount, total }: InvoiceTotalsProps) {
  const { data: taxes } = useQuery({
    queryKey: ["business-taxes"],
    queryFn: async () => {
      const { data: businessProfile } = await supabase
        .from("business_profile")
        .select("id")
        .limit(1)
        .maybeSingle();

      if (!businessProfile?.id) return [];
      
      const { data, error } = await supabase
        .from("business_taxes")
        .select("*")
        .eq("business_id", businessProfile.id);

      if (error) throw error;
      return data;
    },
  });

  const gstTax = taxes?.find(tax => tax.tax_type === "GST");
  const qstTax = taxes?.find(tax => tax.tax_type === "QST");

  const gstAmount = subtotal * ((gstTax?.tax_rate || 0) / 100);
  const qstAmount = subtotal * ((qstTax?.tax_rate || 0) / 100);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 items-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-[#8E9196]">
            <span>Sous-total / Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {gstTax && (
            <div className="flex justify-between text-[#8E9196]">
              <span>TPS/GST ({gstTax.tax_rate}%)</span>
              <span>{formatCurrency(gstAmount)}</span>
            </div>
          )}
          {qstTax && (
            <div className="flex justify-between text-[#8E9196]">
              <span>TVQ/QST ({qstTax.tax_rate}%)</span>
              <span>{formatCurrency(qstAmount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-[#1A1F2C] pt-2 border-t border-[#F1F0FB]">
            <span>Total / Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
        <div className="text-sm text-[#8E9196] text-right">
          {gstTax && <div>TPS/GST No: {gstTax.tax_number}</div>}
          {qstTax && <div>TVQ/QST No: {qstTax.tax_number}</div>}
        </div>
      </div>
      {total > 0 && (
        <div className="mt-6 inline-block">
          <div className="bg-[#FEF7CD] text-[#B99F24] px-4 py-2 rounded-lg text-sm">
            <div className="font-semibold">PAIEMENT DÛ / PAYMENT DUE</div>
            <div>Date d'échéance / Due by: {new Date().toLocaleDateString()}</div>
          </div>
        </div>
      )}
    </div>
  );
}