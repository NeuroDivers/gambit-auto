
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
            service_id,
            package_id,
            service_name,
            description,
            quantity,
            unit_price,
            service:service_types (
              id,
              name,
              description
            ),
            package:service_packages (
              id,
              name,
              description
            )
          )
        `)
        .eq('id', invoiceId)
        .maybeSingle()

      if (error) throw error

      // Transform the data to match our expected format
      if (data) {
        return {
          ...data,
          invoice_items: data.invoice_items.map((item: any) => ({
            service_id: item.service_id,
            package_id: item.package_id,
            service_name: item.service_name || item.service?.name || '',
            description: item.description || item.service?.description || '',
            quantity: item.quantity,
            unit_price: item.unit_price
          }))
        }
      }

      return data
    },
    enabled: !!invoiceId
  })
}
