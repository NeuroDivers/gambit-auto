
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export function useInvoiceStatistics(isClient: boolean | undefined, clientId: string | null) {
  return useQuery({
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
}
