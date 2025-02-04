import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { WorkOrderCard } from "../WorkOrderCard"
import { StatusLegend } from "../StatusLegend"
import { LoadingState } from "../LoadingState"
import type { WorkOrder } from "../types"

export function WorkOrdersSection() {
  const { data: requests, isLoading } = useQuery({
    queryKey: ["workOrders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_orders")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      return data as WorkOrder[]
    },
  })

  const statusCounts = {
    pending: requests?.filter(r => r.status === 'pending').length || 0,
    approved: requests?.filter(r => r.status === 'approved').length || 0,
    rejected: requests?.filter(r => r.status === 'rejected').length || 0,
    completed: requests?.filter(r => r.status === 'completed').length || 0
  }

  if (isLoading) {
    return <LoadingState />
  }

  return (
    <section 
      className="bg-card/50 backdrop-blur-sm rounded-xl shadow-lg border border-white/5 p-8 relative" 
      style={{ zIndex: 0, position: 'relative' }}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Work Orders</h3>
        </div>
        <StatusLegend statusCounts={statusCounts} />
        {requests?.map((request) => (
          <WorkOrderCard key={request.id} request={request} />
        ))}
        {requests?.length === 0 && (
          <div className="text-center py-8 text-white/60">
            No work orders yet
          </div>
        )}
      </div>
    </section>
  )
}