import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useEffect } from "react"
import { WorkOrdersSection } from "./sections/WorkOrdersSection"
import { WorkOrderCalendar } from "./WorkOrderCalendar"
import { toast } from "sonner"

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
          
          // Show toast notification based on the event type
          if (payload.eventType === 'DELETE') {
            toast.info("Work order deleted")
          }
          
          // Invalidate and refetch work orders
          queryClient.invalidateQueries({ queryKey: ["workOrders"] })
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
    <div className="space-y-20">
      <WorkOrderCalendar />
      <WorkOrdersSection />
    </div>
  )
}