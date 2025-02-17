
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
          .select('total, status, payment_status, due_date')
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

        // Calculate additional statistics
        const collection_rate = total_revenue ? (collected_revenue / total_revenue) * 100 : 0
        const average_invoice_value = total_invoices ? total_revenue / total_invoices : 0
        
        // Calculate overdue amount - ensure due_date is compared correctly
        const now = new Date()
        const overdue_amount = invoices
          .filter(inv => 
            inv.payment_status === 'unpaid' && 
            inv.due_date && 
            new Date(inv.due_date) < now
          )
          .reduce((sum, inv) => sum + (inv.total || 0), 0)

        return {
          total_revenue,
          collected_revenue,
          uncollected_revenue,
          total_invoices,
          unpaid_invoices,
          collection_rate,
          average_invoice_value,
          overdue_amount
        }
      } else {
        // Admin view - global statistics
        const { data: invoices } = await supabase
          .from('invoices')
          .select('total, payment_status, due_date')

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

        // Calculate additional statistics
        const collection_rate = total_revenue ? (collected_revenue / total_revenue) * 100 : 0
        const average_invoice_value = total_invoices ? total_revenue / total_invoices : 0

        // Calculate overdue amount - ensure due_date is compared correctly
        const now = new Date()
        const overdue_amount = invoices
          .filter(inv => 
            inv.payment_status === 'unpaid' && 
            inv.due_date && 
            new Date(inv.due_date) < now
          )
          .reduce((sum, inv) => sum + (inv.total || 0), 0)

        return {
          total_revenue,
          collected_revenue,
          uncollected_revenue,
          total_invoices,
          unpaid_invoices,
          collection_rate,
          average_invoice_value,
          overdue_amount
        }
      }
    }
  })
}
