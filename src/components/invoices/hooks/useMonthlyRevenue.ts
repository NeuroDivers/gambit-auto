
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export function useMonthlyRevenue(isClient: boolean | undefined, clientId: string | null) {
  return useQuery({
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
}
