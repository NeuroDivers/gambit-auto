import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useEffect } from "react"
import { WorkOrdersSection } from "./sections/WorkOrdersSection"
import { WorkOrderCalendar } from "./WorkOrderCalendar"

export const WorkOrderList = () => {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel("work_orders_changes")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all changes (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "work_orders",
        },
        (payload) => {
          console.log("Work order change detected:", payload)
          // Invalidate and refetch work orders
          queryClient.invalidateQueries({ queryKey: ["workOrders"] })
        }
      )
      .subscribe()

    return () => {
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