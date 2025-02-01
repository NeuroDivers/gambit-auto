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
    <div className="border-t pt-4">
      <div className="space-y-2 text-[#222222]">
        <div className="flex justify-between">
          <span>Sous-total / Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {gstTax && (
          <div className="flex justify-between">
            <span>TPS/GST ({gstTax.tax_rate}%)</span>
            <span>{formatCurrency(gstAmount)}</span>
          </div>
        )}
        {qstTax && (
          <div className="flex justify-between">
            <span>TVQ/QST ({qstTax.tax_rate}%)</span>
            <span>{formatCurrency(qstAmount)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold border-t pt-2">
          <span>Total / Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <div className="text-sm text-[#555555] mt-2">
          {gstTax && <div>TPS/GST No: {gstTax.tax_number}</div>}
          {qstTax && <div>TVQ/QST No: {qstTax.tax_number}</div>}
        </div>
      </div>
    </div>
  );
}