import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { LoadingState } from "../../quotes/LoadingState"
import { Button } from "@/components/ui/button"
import { PlusCircle, Pencil } from "lucide-react"
import { useState } from "react"
import { CreateWorkOrderDialog } from "../CreateWorkOrderDialog"
import { WorkOrderDialog } from "../WorkOrderDialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { WorkOrder } from "../types"

export function WorkOrdersSection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null)

  const { data: workOrders, isLoading } = useQuery({
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
            quote_request_services (
              service_types (
                name
              )
            )
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data as WorkOrder[]
    },
  })

  const handleEdit = (order: WorkOrder) => {
    setSelectedWorkOrder(order)
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('work_orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating work order status:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/20'
      case 'in_progress':
        return 'text-blue-400 bg-blue-500/20'
      case 'completed':
        return 'text-green-400 bg-green-500/20'
      case 'cancelled':
        return 'text-red-400 bg-red-500/20'
      default:
        return 'text-gray-400 bg-gray-500/20'
    }
  }

  if (isLoading) {
    return <LoadingState />
  }

  return (
    <section className="bg-card/50 backdrop-blur-sm rounded-xl shadow-lg border border-white/5 p-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Work Orders</h3>
          <Button
            onClick={() => setIsDialogOpen(true)}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Create Work Order
          </Button>
        </div>
        {workOrders?.map((order) => (
          <div key={order.id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h4 className="font-medium">
                  {order.quote_requests?.first_name} {order.quote_requests?.last_name}
                </h4>
                <p className="text-sm text-white/60">
                  Bay: {order.service_bays?.name}
                </p>
                <p className="text-sm text-white/60">
                  Services: {order.quote_requests?.quote_request_services?.map(s => s.service_types.name).join(", ")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  defaultValue={order.status}
                  onValueChange={(value) => handleStatusChange(order.id, value)}
                >
                  <SelectTrigger className={`w-[130px] ${getStatusColor(order.status)}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(order)}
                  className="h-8 w-8"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {workOrders?.length === 0 && (
          <div className="text-center py-8 text-white/60">
            No work orders yet
          </div>
        )}
      </div>

      <CreateWorkOrderDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />

      {selectedWorkOrder && (
        <WorkOrderDialog
          open={!!selectedWorkOrder}
          onOpenChange={(open) => !open && setSelectedWorkOrder(null)}
          workOrder={selectedWorkOrder}
        />
      )}
    </section>
  )
}