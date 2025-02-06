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
          invoice_items (
            id,
            service_name,
            description,
            quantity,
            unit_price
          )
        `)
        .eq('id', invoiceId)
        .maybeSingle()

      if (error) throw error
      return data
    },
    enabled: !!invoiceId
  })
}