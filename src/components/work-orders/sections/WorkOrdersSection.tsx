import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { LoadingState } from "../../quotes/LoadingState"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useState } from "react"
import { CreateWorkOrderDialog } from "../CreateWorkOrderDialog"
import type { WorkOrder } from "../types"

export function WorkOrdersSection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

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
            <div className="flex justify-between">
              <div>
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
              <div className="text-sm">
                Status: {order.status}
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
    </section>
  )
}