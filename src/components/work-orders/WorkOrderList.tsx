
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useEffect } from "react"
import { WorkOrdersSection } from "./sections/WorkOrdersSection"
import { WorkOrderCalendar } from "./WorkOrderCalendar"
import { toast } from "sonner"
import { CreateWorkOrderDialog } from "./CreateWorkOrderDialog"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { CalendarClock } from "lucide-react"

export const WorkOrderList = () => {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel("work_orders_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "work_orders",
        },
        (payload) => {
          console.log("Work order change detected:", payload)
          
          switch (payload.eventType) {
            case "DELETE":
              toast.info("Work order deleted")
              queryClient.setQueryData(["workOrders"], (oldData: any) => {
                if (!oldData) return oldData
                return oldData.filter((workOrder: any) => workOrder.id !== payload.old.id)
              })
              break
            case "INSERT":
              toast.success("New work order created")
              queryClient.invalidateQueries({ queryKey: ["workOrders"] })
              break
            case "UPDATE":
              toast.success("Work order updated")
              queryClient.invalidateQueries({ queryKey: ["workOrders"] })
              break
          }
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status)
      })

    return () => {
      console.log("Cleaning up subscription")
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  return (
    <div className="space-y-8">
      <div className="flex justify-end px-6">
        <CreateWorkOrderDialog />
      </div>
      <div className="space-y-20">
        <WorkOrderCalendar />
        <Alert>
          <CalendarClock className="h-4 w-4" />
          <AlertTitle>Unscheduled Work Orders</AlertTitle>
          <AlertDescription>
            Work orders without a start time won't appear on the calendar. They will be listed in the section below.
          </AlertDescription>
        </Alert>
        <WorkOrdersSection />
      </div>
    </div>
  )
}
