
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { WorkOrder } from "@/components/work-orders/types"

export function useWorkOrderData(month: Date) {
  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1)
  const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0)
  
  // Format dates for Supabase query
  const startDateStr = startOfMonth.toISOString()
  const endDateStr = endOfMonth.toISOString()

  return useQuery({
    queryKey: ["work-orders", "calendar", startDateStr, endDateStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_orders")
        .select("*")
        .gte("start_time", startDateStr)
        .lte("start_time", endDateStr)
        .order("start_time")

      if (error) {
        console.error("Error fetching work orders:", error)
        throw error
      }

      return data as WorkOrder[]
    }
  })
}
