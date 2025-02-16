
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Invoice } from "../types"

export function useInvoiceData(invoiceId: string | undefined) {
  return useQuery({
    queryKey: ["invoice", invoiceId],
    enabled: !!invoiceId,
    queryFn: async () => {
      if (!invoiceId) throw new Error("Invoice ID is required")

      const { data: invoice, error: invoiceError } = await supabase
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
        .eq("id", invoiceId)
        .maybeSingle()

      if (invoiceError) throw invoiceError
      if (!invoice) throw new Error("Invoice not found")

      return invoice as Invoice
    }
  })
}
