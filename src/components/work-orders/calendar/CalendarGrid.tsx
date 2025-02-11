
import React from "react"
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, format, addDays, parseISO, isSameDay, differenceInDays } from "date-fns"
import { CalendarDay } from "./CalendarDay"
import { WorkOrder } from "../types"
import { useBlockedDates } from "./hooks/useBlockedDates"
import { useIsMobile } from "@/hooks/use-mobile"
import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

type CalendarGridProps = {
  currentDate: Date
  workOrders: WorkOrder[]
}

type ServiceBay = {
  id: string
  name: string
}

export function CalendarGrid({ currentDate, workOrders }: CalendarGridProps) {
  const isMobile = useIsMobile()
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const { blockedDates } = useBlockedDates()

  // Fetch service bays
  const { data: serviceBays = [] } = useQuery({
    queryKey: ["serviceBays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_bays")
        .select("id, name")
        .order("name")
      
      if (error) throw error
      return data as ServiceBay[]
    }
  })

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  })

  const getWorkOrdersForDay = (date: Date, bayId: string) => {
    return workOrders.filter(workOrder => {
      if (!workOrder.start_time || workOrder.assigned_bay_id !== bayId) return false
      
      const startDate = parseISO(workOrder.start_time)
      const endDate = workOrder.end_time ? parseISO(workOrder.end_time) : startDate
      
      // Check if the current date falls between start and end dates
      const isWithinDuration = (
        isSameDay(date, startDate) || 
        isSameDay(date, endDate) ||
        (date > startDate && date < endDate)
      )
      
      return isWithinDuration
    }).map(order => ({
      ...order,
      isStart: isSameDay(date, parseISO(order.start_time)),
      isEnd: order.end_time ? isSameDay(date, parseISO(order.end_time)) : true,
      duration: order.end_time ? 
        differenceInDays(parseISO(order.end_time), parseISO(order.start_time)) + 1 : 
        1
    }))
  }

  if (isMobile) {
    // Show 7 days starting from current date for mobile view
    const mobileDays = Array.from({ length: 7 }, (_, i) => addDays(currentDate, i))

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => setShowMonthPicker(true)}
            className="font-semibold"
          >
            {format(currentDate, 'MMMM yyyy')}
          </Button>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header with days */}
            <div className="grid grid-cols-[120px_repeat(7,1fr)] gap-4 bg-muted/50 p-2 rounded-t-lg">
              <div className="text-sm font-medium text-muted-foreground">Bays</div>
              {mobileDays.map((day) => (
                <div key={day.toISOString()} className="text-sm font-medium text-muted-foreground text-center">
                  {format(day, 'EEE d')}
                </div>
              ))}
            </div>

            {/* Grid with bays and time slots */}
            <div className="grid grid-cols-[120px_repeat(7,1fr)] gap-4 bg-card/50">
              {serviceBays.map((bay) => (
                <React.Fragment key={bay.id}>
                  <div className="p-2 text-sm font-medium">{bay.name}</div>
                  {mobileDays.map((day) => (
                    <div 
                      key={day.toISOString()}
                      className="p-2 border-l min-h-[80px]"
                    >
                      {getWorkOrdersForDay(day, bay.id).map((order) => (
                        <div 
                          key={order.id}
                          className={`text-xs p-1 bg-primary/10 rounded mb-1 ${
                            order.isStart && order.duration > 1 ? 'rounded-r-none' : ''
                          } ${
                            !order.isStart && !order.isEnd ? 'rounded-none border-l-0 border-r-0' : ''
                          } ${
                            order.isEnd && !order.isStart ? 'rounded-l-none' : ''
                          }`}
                          style={{
                            marginLeft: order.isStart ? '0' : '-2px',
                            marginRight: order.isEnd ? '0' : '-2px',
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            borderColor: 'rgba(var(--primary), 0.2)'
                          }}
                        >
                          {order.first_name} {order.last_name}
                        </div>
                      ))}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <Dialog open={showMonthPicker} onOpenChange={setShowMonthPicker}>
          <DialogContent>
            <Calendar
              mode="single"
              selected={currentDate}
              onSelect={(date) => {
                if (date) {
                  setShowMonthPicker(false)
                }
              }}
              className="rounded-md border"
            />
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-card/50 p-4">
      <div className="grid grid-cols-7 gap-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-sm font-medium text-muted-foreground text-center py-2">
            {day}
          </div>
        ))}
        {days.map((day) => (
          <CalendarDay
            key={day.toISOString()}
            date={day}
            workOrders={workOrders.filter(wo => {
              if (!wo.start_time) return false
              return isSameDay(parseISO(wo.start_time), day)
            })}
            isCurrentMonth={isSameMonth(day, currentDate)}
            blockedDates={blockedDates}
          />
        ))}
      </div>
    </div>
  )
}
