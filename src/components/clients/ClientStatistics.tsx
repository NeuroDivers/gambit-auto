import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from "date-fns"
import { Client } from "./types"

interface RevenueStatistic {
  month: string
  total_invoices: number
  total_revenue: number
  collected_revenue: number
  paid_invoices: number
  unpaid_invoices: number
}

interface ClientStatisticsProps {
  client: Client
  data?: RevenueStatistic[]
}

export function ClientStatistics({ client, data }: ClientStatisticsProps) {
  // Calculate summary statistics
  const totalRevenue = data?.reduce((sum, month) => sum + Number(month.total_revenue), 0) || 0
  const collectedRevenue = data?.reduce((sum, month) => sum + Number(month.collected_revenue), 0) || 0
  const totalInvoices = data?.reduce((sum, month) => sum + month.total_invoices, 0) || 0
  const pendingInvoices = data?.reduce((sum, month) => sum + month.unpaid_invoices, 0) || 0

  const chartData = data?.map(month => ({
    name: format(new Date(month.month), 'MMM yyyy'),
    revenue: Number(month.total_revenue),
    collected: Number(month.collected_revenue)
  })).reverse()

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Last 12 months
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collected Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(collectedRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {((collectedRevenue / totalRevenue) * 100).toFixed(1)}% collection rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvoices}</div>
            <p className="text-xs text-muted-foreground">
              Last 12 months
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingInvoices}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting payment
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => formatCurrency(value as number)}
                />
                <Bar dataKey="revenue" name="Total Revenue" fill="var(--primary)" />
                <Bar dataKey="collected" name="Collected" fill="var(--primary-foreground)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
