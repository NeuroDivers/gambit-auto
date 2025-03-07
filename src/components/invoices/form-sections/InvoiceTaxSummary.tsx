
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useEffect } from "react"
import { InvoiceItem } from "../types"

type InvoiceTaxSummaryProps = {
  items?: InvoiceItem[];
  onTotalCalculated?: (subtotal: number, gst: number, qst: number, total: number) => void;
  subtotal?: number;
  taxAmount?: number;
  gstAmount?: number;
  qstAmount?: number;
  total?: number;
}

export function InvoiceTaxSummary({ 
  items, 
  onTotalCalculated,
  subtotal: propSubtotal,
  taxAmount: propTaxAmount,
  gstAmount: propGstAmount,
  qstAmount: propQstAmount,
  total: propTotal
}: InvoiceTaxSummaryProps) {
  // Fetch tax rates
  const { data: taxRates } = useQuery({
    queryKey: ['business-taxes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_taxes')
        .select('*')
      
      if (error) throw error
      return data || []
    }
  });

  // Decide whether to use provided values or calculate from items
  let subtotal = propSubtotal;
  let gstAmount = propGstAmount;
  let qstAmount = propQstAmount;
  let total = propTotal;

  // If we have items and not direct values, calculate them
  if (items && subtotal === undefined) {
    // Calculate subtotal with null check
    subtotal = items?.reduce((acc, item) => {
      const quantity = Number(item?.quantity) || 0
      const unitPrice = Number(item?.unit_price) || 0
      return acc + (quantity * unitPrice)
    }, 0) || 0;

    // Get tax rates with null checks
    const gstRate = taxRates?.find(tax => tax.tax_type === 'GST')?.tax_rate || 0;
    const qstRate = taxRates?.find(tax => tax.tax_type === 'QST')?.tax_rate || 0;

    // Calculate taxes
    gstAmount = subtotal * (gstRate / 100);
    qstAmount = subtotal * (qstRate / 100); // QST calculated on subtotal only
    total = subtotal + (gstAmount || 0) + (qstAmount || 0);

    useEffect(() => {
      if (onTotalCalculated) {
        onTotalCalculated(subtotal || 0, gstAmount || 0, qstAmount || 0, total || 0);
      }
    }, [subtotal, gstAmount, qstAmount, total, onTotalCalculated]);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(subtotal || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">GST</span>
            <span>{formatCurrency(gstAmount || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">QST</span>
            <span>{formatCurrency(qstAmount || 0)}</span>
          </div>
          <div className="flex justify-between font-bold pt-2 border-t">
            <span>Total</span>
            <span>{formatCurrency(total || 0)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
