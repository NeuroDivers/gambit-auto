
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export function useWorkOrderData() {
  return useQuery({
    queryKey: ["workOrders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_orders")
        .select(`
          *,
          work_order_services (
            id,
            service_id,
            quantity,
            unit_price,
            service:service_types!work_order_services_service_id_fkey (
              id,
              name
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    }
  })
}
