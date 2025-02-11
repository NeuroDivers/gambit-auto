
import React, { useRef, useEffect, useState } from "react"
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, format, addDays, parseISO, isSameDay, differenceInDays, addMonths } from "date-fns"
import { CalendarDay } from "./CalendarDay"
import { WorkOrder } from "../types"
import { useBlockedDates } from "./hooks/useBlockedDates"
import { useIsMobile } from "@/hooks/use-mobile"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { ScrollArea } from "@/components/ui/scroll-area"
import { WorkOrderCard } from "./WorkOrderCard"
import { ChevronLeft, ChevronRight } from "lucide-react"

type CalendarGridProps = {
  currentDate: Date
  workOrders: WorkOrder[]
  onDateChange?: (date: Date) => void
}

type ServiceBay = {
  id: string
  name: string
}

export function CalendarGrid({ currentDate, workOrders, onDateChange }: CalendarGridProps) {
  const isMobile = useIsMobile()
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const { blockedDates } = useBlockedDates()
  const [visibleDays, setVisibleDays] = useState<Date[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const [loadedMonths, setLoadedMonths] = useState<Date[]>([currentDate])

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

  useEffect(() => {
    if (isMobile) {
      // Initialize with 20 days
      const initialDays = Array.from({ length: 20 }, (_, i) => addDays(currentDate, i))
      setVisibleDays(initialDays)
    }
  }, [currentDate, isMobile])

  const loadMoreDays = () => {
    if (isMobile) {
      const lastDay = visibleDays[visibleDays.length - 1]
      const nextDays = Array.from({ length: 10 }, (_, i) => addDays(lastDay, i + 1))
      setVisibleDays([...visibleDays, ...nextDays])
    }
  }

  const handleScroll = () => {
    if (!scrollRef.current) return
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    if (scrollWidth - (scrollLeft + clientWidth) < 200) {
      loadMoreDays()
    }
  }

  const handlePreviousMonth = () => {
    if (onDateChange) {
      const prevMonth = new Date(currentDate)
      prevMonth.setMonth(prevMonth.getMonth() - 1)
      onDateChange(prevMonth)
    }
  }

  const handleNextMonth = () => {
    if (onDateChange) {
      const nextMonth = new Date(currentDate)
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      onDateChange(nextMonth)
    }
  }

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
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={handlePreviousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setShowMonthPicker(true)}
              className="font-semibold"
            >
              {format(currentDate, 'MMMM yyyy')}
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea 
          ref={scrollRef} 
          className="h-[600px] rounded-md border"
          onScroll={handleScroll}
        >
          <div className="min-w-[800px] select-none">
            {/* Header with days */}
            <div className="grid grid-cols-[86px_repeat(7,64px)] gap-4 bg-muted/50 p-2 rounded-t-lg sticky top-0 z-10">
              <div className="text-sm font-medium text-muted-foreground">Bays</div>
              {visibleDays.slice(0, 7).map((day) => (
                <div key={day.toISOString()} className="text-sm font-medium text-muted-foreground text-center">
                  {format(day, 'EEE d')}
                </div>
              ))}
            </div>

            {/* Grid with bays and time slots */}
            <div className="grid grid-cols-[86px_repeat(7,64px)] gap-4">
              {serviceBays.map((bay) => (
                <React.Fragment key={bay.id}>
                  <div className="w-[86px] p-2 text-sm font-medium truncate">{bay.name}</div>
                  {visibleDays.slice(0, 7).map((day) => {
                    const workOrdersForDay = getWorkOrdersForDay(day, bay.id)
                    return (
                      <div 
                        key={day.toISOString()}
                        className="relative p-2 border-l h-[80px] min-h-[80px] group hover:bg-muted/50 cursor-pointer"
                        onClick={() => onDateChange?.(day)}
                      >
                        {workOrdersForDay.map((order) => (
                          <WorkOrderCard 
                            key={order.id}
                            workOrder={order}
                            className="mb-1"
                          />
                        ))}
                      </div>
                    )
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </ScrollArea>

        <Dialog open={showMonthPicker} onOpenChange={setShowMonthPicker}>
          <DialogContent className="sm:max-w-[400px] p-0">
            <ScrollArea className="h-[400px]">
              <div className="p-4 space-y-4">
                {Array.from({ length: 12 }, (_, i) => addMonths(currentDate, i)).map((date) => (
                  <Button
                    key={date.toISOString()}
                    variant="ghost"
                    className="w-full justify-start text-left font-normal"
                    onClick={() => {
                      if (onDateChange) onDateChange(date)
                      setShowMonthPicker(false)
                    }}
                  >
                    {format(date, 'MMMM yyyy')}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  })

  return (
    <div className="rounded-lg bg-card/50 p-4">
      <div className="flex items-center justify-between mb-4">
        <Button 
          variant="ghost" 
          onClick={() => setShowMonthPicker(true)}
          className="font-semibold"
        >
          {format(currentDate, 'MMMM yyyy')}
        </Button>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={handlePreviousMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
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
              
              const startDate = parseISO(wo.start_time)
              const endDate = wo.end_time ? parseISO(wo.end_time) : startDate
              
              return (
                isSameDay(day, startDate) || 
                isSameDay(day, endDate) ||
                (day > startDate && day < endDate)
              )
            })}
            isCurrentMonth={isSameMonth(day, currentDate)}
            blockedDates={blockedDates}
          />
        ))}
      </div>
    </div>
  )
}
