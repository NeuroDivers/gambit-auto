
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Invoice } from "../types"

export function useInvoiceData(invoiceId: string | undefined) {
  return useQuery({
    queryKey: ["invoice", invoiceId],
    enabled: !!invoiceId,
    queryFn: async () => {
      if (!invoiceId) throw new Error("Invoice ID is required")

      // First fetch the invoice and work order data
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .select(`
          *,
          work_order:work_orders (*)
        `)
        .eq("id", invoiceId)
        .maybeSingle()

      if (invoiceError) throw invoiceError
      if (!invoice) throw new Error("Invoice not found")

      // Then fetch work order services with their service relationships
      const { data: workOrderServices, error: servicesError } = await supabase
        .from("work_order_services")
        .select(`
          id,
          work_order_id,
          service_id,
          quantity,
          unit_price,
          service:service_types!work_order_services_service_id_fkey (
            id,
            name,
            price
          ),
          main_service:service_types!work_order_services_main_service_id_fkey (
            id,
            name,
            price
          ),
          sub_service:service_types!work_order_services_sub_service_id_fkey (
            id,
            name,
            price
          )
        `)
        .eq("work_order_id", invoice.work_order.id)

      if (servicesError) throw servicesError

      // Combine the data
      return {
        ...invoice,
        work_order: {
          ...invoice.work_order,
          work_order_services: workOrderServices
        }
      } as Invoice
    }
  })
}
