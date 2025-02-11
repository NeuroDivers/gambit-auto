
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { WorkOrder } from "../../types"

export function WorkOrdersSection() {
  const { data: unscheduledWorkOrders = [] } = useQuery({
    queryKey: ["unscheduledWorkOrders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_orders")
        .select("*")
        .is("start_time", null)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data as WorkOrder[]
    }
  })

  if (unscheduledWorkOrders.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {unscheduledWorkOrders.map((workOrder) => (
        <div 
          key={workOrder.id}
          className="p-4 rounded-lg border border-border/50 bg-card"
        >
          <h4 className="font-medium">{workOrder.title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{workOrder.description}</p>
        </div>
      ))}
    </div>
  )
}
