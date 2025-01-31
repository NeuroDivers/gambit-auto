import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { CreateWorkOrderDialog } from "./CreateWorkOrderDialog"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CalendarDay } from "./calendar/CalendarDay"
import { CalendarGrid } from "./calendar/CalendarGrid"
import type { WorkOrder } from "./types"

export function WorkOrderCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [view, setView] = useState<'month' | 'day'>('month')

  const { data: workOrders } = useQuery({
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
            vehicle_make,
            vehicle_model,
            vehicle_year,
            quote_request_services (
              service_types (
                name
              )
            )
          )
        `)
      if (error) throw error
      return data as WorkOrder[]
    },
  })

  const { data: serviceBays } = useQuery({
    queryKey: ["serviceBays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_bays")
        .select("*")
      if (error) throw error
      return data
    },
  })

  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    setIsDialogOpen(true)
  }

  const getWorkOrdersForDate = (date: Date) => {
    return workOrders?.filter(order => {
      const orderDate = new Date(order.start_date)
      return orderDate.toDateString() === date.toDateString()
    })
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Bay Availability</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-card rounded-lg p-1">
            <Button
              variant={view === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('month')}
            >
              Month
            </Button>
            <Button
              variant={view === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('day')}
            >
              Day
            </Button>
          </div>
          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      {view === 'month' ? (
        <div className="rounded-lg border bg-[#1a1a1a] p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            className="w-full"
            components={{
              Day: ({ date, ...props }) => (
                <CalendarDay
                  date={date}
                  workOrders={getWorkOrdersForDate(date)}
                  onSelect={handleSelect}
                  {...props}
                />
              ),
            }}
            classNames={{
              months: "w-full",
              month: "w-full",
              table: "w-full border-collapse",
              head_row: "flex w-full",
              head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.9rem] capitalize",
              row: "flex w-full mt-2",
              cell: cn(
                "relative w-full p-2 h-full border border-border rounded-lg overflow-hidden transition-colors",
                "hover:bg-primary/10",
                "first:[&:has([aria-selected])]:rounded-l-lg last:[&:has([aria-selected])]:rounded-r-lg",
                "[&:has([aria-selected])]:bg-primary/50 [&:has([aria-selected])]:text-primary-foreground",
                "[&:has([data-outside-month])]:opacity-50 [&:has([data-outside-month])]:pointer-events-none"
              ),
              day: "h-full w-full",
              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              day_today: "bg-accent text-accent-foreground",
              day_outside: "text-muted-foreground opacity-50",
            }}
          />
        </div>
      ) : (
        <div className="rounded-lg border bg-[#1a1a1a] p-4">
          <CalendarGrid
            selectedDate={selectedDate || new Date()}
            serviceBays={serviceBays}
          />
        </div>
      )}

      <CreateWorkOrderDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedDate={selectedDate}
      />
    </div>
  )
}