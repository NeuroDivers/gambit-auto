import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { CalendarGrid } from "./calendar/CalendarGrid"
import { CreateWorkOrderDialog } from "./CreateWorkOrderDialog"
import { useState, useEffect } from "react"
import type { WorkOrder } from "./types"

export function WorkOrderCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: workOrders } = useQuery({
    queryKey: ["workOrders"],
    queryFn: async () => {
      const startDate = startOfMonth(new Date())
      const endDate = endOfMonth(new Date())

      const { data, error } = await supabase
        .from("work_orders")
        .select(`
          *,
          quote_requests (
            first_name,
            last_name,
            status,
            quote_request_services (
              service_types (
                name
              )
            )
          )
        `)
        .gte("start_date", format(startDate, "yyyy-MM-dd"))
        .lte("end_date", format(endDate, "yyyy-MM-dd"))

      if (error) throw error

      // Only return work orders where the associated quote is approved
      return (data as any[]).filter(order => 
        order.quote_requests?.status === 'approved'
      ) as WorkOrder[]
    },
  })

  useEffect(() => {
    const channel = supabase
      .channel("quote_requests_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "quote_requests",
        },
        () => {
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
        selectedDate={selectedDate || new Date()}
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