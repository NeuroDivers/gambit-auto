
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Invoice } from "../types"

export function useInvoiceData(invoiceId: string | undefined) {
  return useQuery({
    queryKey: ["invoice", invoiceId],
    enabled: !!invoiceId,
    queryFn: async () => {
      if (!invoiceId) throw new Error("Invoice ID is required")

      // First fetch the invoice data with all related information
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .select(`
          *,
          work_order:work_orders!inner (
            *,
            work_order_services (
              id,
              quantity,
              unit_price,
              service:service_types!work_order_services_service_id_fkey (
                id,
                name,
                price
              )
            )
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
