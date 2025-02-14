
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Invoice } from "../types"

export function useInvoiceData(invoiceId: string) {
  return useQuery({
    queryKey: ["invoice", invoiceId],
    enabled: !!invoiceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          invoice_items (
            id,
            service_id,
            package_id,
            service_name,
            description,
            quantity,
            unit_price
          )
        `)
        .eq('id', invoiceId)
        .single()
      
      if (error) throw error
      return data as Invoice
    }
  })
}
