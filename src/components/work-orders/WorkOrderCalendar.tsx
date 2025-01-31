import * as React from "react"
import { Calendar as CalendarIcon, Plus } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { CreateWorkOrderDialog } from "./CreateWorkOrderDialog"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

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
      return data
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

  const filteredWorkOrders = workOrders?.filter(order => {
    if (!selectedDate || view === 'month') return true
    const orderDate = new Date(order.start_date)
    return orderDate.toDateString() === selectedDate.toDateString()
  })

  const getWorkOrdersForDate = (date: Date) => {
    return workOrders?.filter(order => {
      const orderDate = new Date(order.start_date)
      return orderDate.toDateString() === date.toDateString()
    })
  }

  const renderWorkOrderContent = (order: any) => {
    const services = order.quote_requests?.quote_request_services?.map(
      (s: any) => s.service_types.name
    ).join(", ")

    return (
      <div className="space-y-2">
        <h4 className="font-semibold">
          {order.quote_requests?.first_name} {order.quote_requests?.last_name}
        </h4>
        <div className="text-sm space-y-1">
          <p>Time: {format(new Date(order.start_date), "HH:mm")}</p>
          <p>Services: {services}</p>
          <p>Status: {order.status}</p>
          <p>Bay: {order.service_bays?.name}</p>
        </div>
      </div>
    )
  }

  const timeSlots = Array.from({ length: 10 }, (_, i) => {
    const hour = 9 + i
    return `${hour.toString().padStart(2, '0')}:00`
  })

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
              Day: ({ date, ...props }) => {
                const dayWorkOrders = getWorkOrdersForDate(date)
                return (
                  <div className="relative h-full w-full min-h-[100px] p-1 group">
                    <button {...props} className="absolute top-2 left-2 text-sm">
                      {format(date, 'd')}
                    </button>
                    <Plus className="absolute top-2 right-2 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="pt-8 space-y-1">
                      {dayWorkOrders?.map((order) => (
                        <HoverCard key={order.id}>
                          <HoverCardTrigger>
                            <div 
                              className={cn(
                                "text-xs p-1 rounded text-left truncate",
                                order.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-green-500/20 text-green-400'
                              )}
                            >
                              {format(new Date(order.start_date), "HH:mm")} - {order.quote_requests?.first_name}
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80">
                            {renderWorkOrderContent(order)}
                          </HoverCardContent>
                        </HoverCard>
                      ))}
                    </div>
                  </div>
                )
              }
            }}
            classNames={{
              months: "w-full",
              month: "w-full",
              table: "w-full border-collapse",
              head_row: "flex w-full",
              head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.9rem] capitalize",
              row: "flex w-full mt-2",
              cell: cn(
                "relative w-full pt-1 px-1 h-full border border-border overflow-hidden transition-colors",
                "hover:bg-primary/10"
              ),
              day: "h-full w-full",
              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              day_today: "bg-accent text-accent-foreground",
            }}
          />
        </div>
      ) : (
        <div className="rounded-lg border bg-[#1a1a1a] p-4">
          <div className="grid grid-cols-[auto,1fr,1fr,1fr] gap-4">
            <div className="font-medium">Time</div>
            {serviceBays?.map(bay => (
              <div key={bay.id} className="font-medium">
                {bay.name}
                <div className="text-sm text-muted-foreground">
                  {format(selectedDate || new Date(), 'EEEE')}
                </div>
              </div>
            ))}
            {timeSlots.map(time => (
              <React.Fragment key={time}>
                <div className="py-4">{time}</div>
                {serviceBays?.map(bay => (
                  <div
                    key={bay.id}
                    className="border-t border-border py-4 text-muted-foreground"
                  >
                    Available
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
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