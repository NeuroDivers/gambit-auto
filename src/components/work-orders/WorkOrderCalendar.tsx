import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { CalendarGrid } from "./calendar/CalendarGrid"
import { CreateWorkOrderDialog } from "./CreateWorkOrderDialog"
import { useState } from "react"
import type { WorkOrder } from "./types"

export function WorkOrderCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data: workOrders } = useQuery({
    queryKey: ["workOrders"],
    queryFn: async () => {
      const startDate = startOfMonth(new Date())
      const endDate = endOfMonth(new Date())

      const { data, error } = await supabase
        .from("work_orders")
        .select(`
          *,
          quote_request:quote_requests (
            status
          )
        `)
        .gte("start_date", format(startDate, "yyyy-MM-dd"))
        .lte("end_date", format(endDate, "yyyy-MM-dd"))

      if (error) throw error

      // Only return work orders where the associated quote is approved
      return (data as any[]).filter(order => 
        order.quote_request?.status === 'approved'
      ) as WorkOrder[]
    },
  })

  useEffect(() => {
    const channel = supabase
      .channel("work_orders_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "quote_requests",
        },
        () => {
          // Invalidate the work orders query when quote status changes
          queryClient.invalidateQueries({ queryKey: ["workOrders"] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  return (
    <div className="space-y-4">
      <CalendarGrid
        workOrders={workOrders || []}
        onSelectDate={(date) => {
          setSelectedDate(date)
          setIsDialogOpen(true)
        }}
      />
      <CreateWorkOrderDialog
        selectedDate={selectedDate}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  )
}