
import { useQueryClient, useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useEffect, useState } from "react"
import { WorkOrdersSection } from "@/components/work-orders/sections/WorkOrdersSection"
import { MobileCalendarView } from "@/components/work-orders/calendar/mobile/MobileCalendarView"
import { toast } from "sonner"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { CalendarClock, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

interface WorkOrderCalendarProps {
  clientView?: boolean;
}

export const WorkOrderCalendar = ({ clientView = false }: WorkOrderCalendarProps) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [currentDate] = useState(new Date())

  const { data: workOrders = [] } = useQuery({
    queryKey: ["workOrders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_orders")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      return data
    }
  })

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
      {!clientView && (
        <div className="flex justify-end px-6">
          <Button onClick={() => navigate("/admin/work-orders/create")}>
            <Plus className="h-4 w-4 mr-2" />
            New Work Order
          </Button>
        </div>
      )}
      <div className="space-y-20">
        <MobileCalendarView
          currentDate={currentDate}
          workOrders={workOrders}
          onDateChange={(date) => console.log("Date changed:", date)}
        />
        {!clientView && (
          <>
            <Alert>
              <CalendarClock className="h-4 w-4" />
              <AlertTitle>Unscheduled Work Orders</AlertTitle>
              <AlertDescription>
                Work orders without a start time won't appear on the calendar. They will be listed in the section below.
              </AlertDescription>
            </Alert>
            <WorkOrdersSection />
          </>
        )}
      </div>
    </div>
  )
}
