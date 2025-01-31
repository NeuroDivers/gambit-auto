import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export function useWorkOrderData() {
  const { data: workOrders } = useQuery({
    queryKey: ["workOrders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_orders")
        .select(`
          *,
          service_bays (
            name
          ),
          quote_requests (
            first_name,
            last_name,
            vehicle_make,
            vehicle_model,
            vehicle_year,
            quote_request_services (
              service_types (
                name
              )
            )
          )
        `)
      if (error) throw error
      return data
    },
  })

  const { data: serviceBays } = useQuery({
    queryKey: ["serviceBays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_bays")
        .select("*")
      if (error) throw error
      return data
    },
  })

  return { workOrders, serviceBays }
}