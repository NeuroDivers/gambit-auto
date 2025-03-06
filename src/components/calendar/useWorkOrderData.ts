
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { WorkOrder } from "@/components/work-orders/types"

export function useWorkOrderData() {
  return useQuery({
    queryKey: ["workOrders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_orders")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      return data as WorkOrder[]
    }
  })
}
