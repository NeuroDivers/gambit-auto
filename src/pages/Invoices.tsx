
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { InvoiceList } from "@/components/invoices/InvoiceList"
import { useNavigate } from "react-router-dom"
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Invoices() {
  const navigate = useNavigate()

  // Check if user is a client
  const { data: isClient } = useQuery({
    queryKey: ["isClient"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { data } = await supabase.rpc('has_role_by_name', {
        user_id: user.id,
        role_name: 'client'
      })
      
      return !!data
    }
  })

  // Fetch client ID if user is a client
  const { data: clientId } = useQuery({
    queryKey: ["clientId"],
    enabled: isClient,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", user.id)
        .single()
      
      return data?.id
    }
  })

  // Fetch revenue statistics based on user role
  const { data: stats } = useQuery({
    queryKey: ["revenue-statistics", clientId],
    enabled: !isClient || !!clientId,
    queryFn: async () => {
      if (isClient && clientId) {
        // Client-specific statistics
        const { data: invoices } = await supabase
          .from('invoices')
          .select('total, status, payment_status')
          .eq('client_id', clientId)

        if (!invoices) return null

        const total_revenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0)
        const collected_revenue = invoices
          .filter(inv => inv.payment_status === 'paid')
          .reduce((sum, inv) => sum + (inv.total || 0), 0)
        const uncollected_revenue = invoices
          .filter(inv => inv.payment_status === 'unpaid')
          .reduce((sum, inv) => sum + (inv.total || 0), 0)
        const total_invoices = invoices.length
        const unpaid_invoices = invoices.filter(inv => inv.payment_status === 'unpaid').length

        return {
          total_revenue,
          collected_revenue,
          uncollected_revenue,
          total_invoices,
          unpaid_invoices
        }
      } else {
        // Admin view - global statistics
        const { data: invoices } = await supabase
          .from('invoices')
          .select('total, payment_status')

        if (!invoices) return null

        const total_revenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0)
        const collected_revenue = invoices
          .filter(inv => inv.payment_status === 'paid')
          .reduce((sum, inv) => sum + (inv.total || 0), 0)
        const uncollected_revenue = invoices
          .filter(inv => inv.payment_status === 'unpaid')
          .reduce((sum, inv) => sum + (inv.total || 0), 0)
        const total_invoices = invoices.length
        const unpaid_invoices = invoices.filter(inv => inv.payment_status === 'unpaid').length

        return {
          total_revenue,
          collected_revenue,
          uncollected_revenue,
          total_invoices,
          unpaid_invoices
        }
      }
    }
  })

  // Fetch monthly revenue data for chart based on user role
  const { data: monthlyData } = useQuery({
    queryKey: ["monthly-revenue", clientId],
    enabled: !isClient || !!clientId,
    queryFn: async () => {
      if (isClient && clientId) {
        // Client-specific monthly data
        const { data } = await supabase
          .from('invoices')
          .select('created_at, total, payment_status')
          .eq('client_id', clientId)

        if (!data) return []

        type MonthlyTotal = {
          revenue: number;
        }

        // Group by month and calculate totals with proper typing
        const monthlyTotals = data.reduce<Record<string, MonthlyTotal>>((acc, invoice) => {
          const month = new Date(invoice.created_at).toLocaleString('default', { month: 'short' })
          if (!acc[month]) {
            acc[month] = { revenue: 0 }
          }
          acc[month].revenue += invoice.total || 0
          return acc
        }, {})

        return Object.entries(monthlyTotals).map(([month, data]) => ({
          month,
          revenue: data.revenue
        }))
      } else {
        // Admin view - global monthly data
        const { data } = await supabase
          .from('revenue_statistics')
          .select('month, collected_revenue')
          .order('month', { ascending: true })
          .limit(12)

        if (!data) return []
        
        return data.map(item => ({
          month: new Date(item.month).toLocaleString('default', { month: 'short' }),
          revenue: item.collected_revenue || 0
        }))
      }
    }
  })

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <PageBreadcrumbs />
        {!isClient && (
          <Button onClick={() => navigate("/invoices/create")} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Invoice
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total {isClient ? 'Amount' : 'Revenue'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.total_revenue || 0)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.collected_revenue || 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uncollected Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{formatCurrency(stats?.uncollected_revenue || 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unpaid Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.unpaid_invoices || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{isClient ? 'Your Invoice History' : 'Monthly Revenue'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                <Tooltip 
                  formatter={(value) => [`$${value.toLocaleString()}`, isClient ? 'Amount' : 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#9b87f5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <InvoiceList />
    </div>
  )
}
