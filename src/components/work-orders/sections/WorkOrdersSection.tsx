import { WorkOrderCard } from "../WorkOrderCard"
import { StatusLegend } from "../StatusLegend"
import { LoadingState } from "../LoadingState"
import { useWorkOrderData } from "../calendar/useWorkOrderData"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreateWorkOrderDialog } from "../CreateWorkOrderDialog"
import { useState } from "react"

export function WorkOrdersSection() {
  const { data: requests, isLoading } = useWorkOrderData()
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Sort work orders by start_time, putting null dates at the end
  const sortedRequests = requests?.sort((a, b) => {
    if (!a.start_time && !b.start_time) return 0;
    if (!a.start_time) return 1;
    if (!b.start_time) return -1;
    return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
  });

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
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Work Order
          </Button>
        </div>
        <StatusLegend statusCounts={statusCounts} />
        {sortedRequests?.map((request) => (
          <WorkOrderCard key={request.id} request={request} />
        ))}
        {sortedRequests?.length === 0 && (
          <div className="text-center py-8 text-white/60">
            No work orders yet
          </div>
        )}
      </div>
      <CreateWorkOrderDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
      />
    </section>
  )
}