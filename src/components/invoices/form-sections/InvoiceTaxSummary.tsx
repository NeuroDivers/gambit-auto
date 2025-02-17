
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useEffect } from "react"
import { InvoiceItem } from "../types"

type InvoiceTaxSummaryProps = {
  items: InvoiceItem[]
  onTotalCalculated?: (subtotal: number, gst: number, qst: number, total: number) => void
}

export function InvoiceTaxSummary({ items, onTotalCalculated }: InvoiceTaxSummaryProps) {
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
  })

  // Calculate subtotal
  const subtotal = items.reduce((acc, item) => {
    return acc + (Number(item.quantity) * Number(item.unit_price))
  }, 0)

  // Get tax rates
  const gstRate = taxRates?.find(tax => tax.tax_type === 'GST')?.tax_rate || 0
  const qstRate = taxRates?.find(tax => tax.tax_type === 'QST')?.tax_rate || 0

  // Calculate taxes
  const gstAmount = subtotal * (gstRate / 100)
  const qstAmount = (subtotal + gstAmount) * (qstRate / 100)
  const total = subtotal + gstAmount + qstAmount

  useEffect(() => {
    if (onTotalCalculated) {
      onTotalCalculated(subtotal, gstAmount, qstAmount, total)
    }
  }, [subtotal, gstAmount, qstAmount, total, onTotalCalculated])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">GST ({gstRate}%)</span>
            <span>{formatCurrency(gstAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">QST ({qstRate}%)</span>
            <span>{formatCurrency(qstAmount)}</span>
          </div>
          <div className="flex justify-between font-bold pt-2 border-t">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
