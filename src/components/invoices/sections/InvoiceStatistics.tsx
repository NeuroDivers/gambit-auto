
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

type InvoiceStatisticsProps = {
  stats: {
    total_revenue: number
    collected_revenue: number
    uncollected_revenue: number
    unpaid_invoices: number
    total_invoices: number
    collection_rate: number
    average_invoice_value: number
    overdue_amount: number
  } | null
  isClient: boolean | undefined
}

export function InvoiceStatistics({ stats, isClient }: InvoiceStatisticsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total {isClient ? 'Amount' : 'Revenue'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats?.total_revenue || 0)}</div>
          <p className="text-xs text-muted-foreground">
            From {stats?.total_invoices || 0} invoices
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats?.collected_revenue || 0)}</div>
          <p className="text-xs text-muted-foreground">
            {(stats?.collection_rate || 0).toFixed(1)}% collection rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Uncollected Amount</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-500">{formatCurrency(stats?.uncollected_revenue || 0)}</div>
          <p className="text-xs text-muted-foreground">
            Including {formatCurrency(stats?.overdue_amount || 0)} overdue
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Invoice Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats?.average_invoice_value || 0)}</div>
          <p className="text-xs text-muted-foreground">
            {stats?.unpaid_invoices || 0} unpaid invoices
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
