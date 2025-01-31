import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { CreateWorkOrderDialog } from "./CreateWorkOrderDialog"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
            vehicle_year
          )
        `)
      if (error) throw error
      return data
    },
  })

  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    setIsDialogOpen(true)
  }

  const filteredWorkOrders = workOrders?.filter(order => {
    if (!selectedDate || view === 'month') return true
    const orderDate = new Date(order.start_date)
    return orderDate.toDateString() === selectedDate.toDateString()
  })

  return (
    <div className="space-y-6 w-full max-w-none px-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white/[0.87]">Work Orders Calendar</h2>
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

      <div className={cn(
        "rounded-lg border bg-card p-4",
        view === 'month' ? 'w-full' : 'max-w-3xl mx-auto'
      )}>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          className="w-full"
          classNames={{
            months: "w-full",
            month: "w-full",
            table: "w-full",
            head_cell: "text-muted-foreground rounded-md w-14 font-normal text-[0.9rem]",
            cell: "h-14 w-14 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: "h-14 w-14 p-0 font-normal aria-selected:opacity-100 hover:bg-accent rounded-md",
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            day_today: "bg-accent text-accent-foreground",
          }}
          modifiers={{
            booked: (date) => {
              return workOrders?.some(order => {
                const start = new Date(order.start_date)
                const end = new Date(order.end_date)
                return date >= start && date <= end
              }) || false
            }
          }}
          modifiersStyles={{
            booked: {
              backgroundColor: "rgb(14,165,233,0.2)",
              color: "rgb(14,165,233)",
              fontWeight: "bold"
            }
          }}
        />
      </div>

      {view === 'day' && selectedDate && (
        <div className="space-y-4 max-w-3xl mx-auto">
          <h3 className="text-lg font-semibold">
            Appointments for {format(selectedDate, 'PPPP')}
          </h3>
          {filteredWorkOrders?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No work orders scheduled for this day
            </p>
          ) : (
            filteredWorkOrders?.map(order => (
              <div
                key={order.id}
                className="p-4 border rounded-lg space-y-2 bg-card"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">
                      {order.quote_requests?.first_name} {order.quote_requests?.last_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {order.quote_requests?.vehicle_year} {order.quote_requests?.vehicle_make} {order.quote_requests?.vehicle_model}
                    </p>
                  </div>
                  <Badge>{order.status}</Badge>
                </div>
                <div className="text-sm">
                  <p>Bay: {order.service_bays?.name}</p>
                  <p>
                    {format(new Date(order.start_date), "p")} - 
                    {format(new Date(order.end_date), "p")}
                  </p>
                </div>
              </div>
            ))
          )}
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