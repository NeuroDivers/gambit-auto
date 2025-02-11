
import { format, addDays, parseISO, isSameDay, differenceInDays } from "date-fns"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { WorkOrder } from "../types"
import { WorkOrderCard } from "./WorkOrderCard"
import React, { useRef, useEffect, useState } from "react"
import { MonthPicker } from "./MonthPicker"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

type ServiceBay = {
  id: string
  name: string
}

type MobileCalendarViewProps = {
  currentDate: Date
  workOrders: WorkOrder[]
  onDateChange?: (date: Date) => void
}

export function MobileCalendarView({ currentDate, workOrders, onDateChange }: MobileCalendarViewProps) {
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [visibleDays, setVisibleDays] = useState<Date[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

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
    // Initialize with 20 days
    const initialDays = Array.from({ length: 20 }, (_, i) => addDays(currentDate, i))
    setVisibleDays(initialDays)
  }, [currentDate])

  const loadMoreDays = () => {
    const lastDay = visibleDays[visibleDays.length - 1]
    const nextDays = Array.from({ length: 10 }, (_, i) => addDays(lastDay, i + 1))
    setVisibleDays([...visibleDays, ...nextDays])
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
          <div className="grid grid-cols-[86px_repeat(7,64px)] gap-4 bg-muted/50 p-2 rounded-t-lg sticky top-0 z-10">
            <div className="text-sm font-medium text-muted-foreground">Bays</div>
            {visibleDays.slice(0, 7).map((day) => (
              <div key={day.toISOString()} className="text-sm font-medium text-muted-foreground text-center">
                {format(day, 'EEE d')}
              </div>
            ))}
          </div>

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

      <MonthPicker
        currentDate={currentDate}
        open={showMonthPicker}
        onOpenChange={setShowMonthPicker}
        onDateChange={onDateChange || (() => {})}
      />
    </div>
  )
}
