import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export function useInvoiceList() {
  const queryClient = useQueryClient()

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          work_order:work_orders (
            first_name,
            last_name
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data
    },
  })

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('invoice-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['invoices'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const updateInvoiceStatus = async (invoiceId: string, status: string) => {
    const { error } = await supabase
      .from("invoices")
      .update({ status })
      .eq("id", invoiceId)

    if (error) {
      console.error("Error updating invoice status:", error)
    }
  }

  return {
    invoices,
    isLoading,
    setupRealtimeSubscription,
    updateInvoiceStatus
  }
}