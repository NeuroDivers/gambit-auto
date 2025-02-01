import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export function useInvoiceData(invoiceId?: string) {
  return useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          work_order:work_orders (
            *,
            services:work_order_services (
              *,
              service:service_types (*)
            )
          ),
          invoice_items (*)
        `)
        .eq('id', invoiceId)
        .maybeSingle()

      if (error) throw error
      return data
    },
    enabled: !!invoiceId
  })
}