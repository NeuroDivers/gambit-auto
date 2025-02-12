
import { useRef, useState, useCallback, useEffect } from "react"
import { format, addDays, startOfDay, isWithinInterval, parseISO } from "date-fns"
import { cn } from "@/lib/utils"
import { useDragScroll } from "./hooks/useDragScroll"
import { toast } from "sonner"
import { useServiceBays } from "@/components/service-bays/hooks/useServiceBays"
import { WorkOrder } from "../work-orders/types"
import { WorkOrderDetailsDialog } from "../work-orders/calendar/WorkOrderDetailsDialog"
import { CalendarControls } from "./components/CalendarControls"
import { CalendarGrid } from "./components/CalendarGrid"
import { useBlockedDates } from "@/components/work-orders/calendar/hooks/useBlockedDates"

type HorizontalCalendarProps = {
  onDateSelect?: (date: Date) => void
  className?: string
  workOrders?: WorkOrder[]
}

export function HorizontalCalendar({ onDateSelect, className, workOrders = [] }: HorizontalCalendarProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [days, setDays] = useState<Date[]>([])
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'MMMM yyyy'))
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null)
  const { serviceBays } = useServiceBays()
  const { blockedDates } = useBlockedDates()
  const DAYS_TO_LOAD = 14
  const CELL_WIDTH = 80 // Width of each day cell
  const BAY_COLUMN_WIDTH = 100 // Width of the bay column

  const isDateBlocked = (date: Date) => {
    return blockedDates?.some(blocked => 
      isWithinInterval(startOfDay(date), {
        start: parseISO(blocked.start_date),
        end: parseISO(blocked.end_date)
      })
    )
  }

  const {
    handleMouseDown,
    handleMouseMove,
    handleTouchStart,
    handleTouchMove,
    stopDragging
  } = useDragScroll(scrollRef)

  useEffect(() => {
    const initialDays = Array.from({ length: DAYS_TO_LOAD }, (_, i) =>
      addDays(startOfDay(new Date()), i)
    )
    setDays(initialDays)
  }, [])

  const handleScroll = useCallback(() => {
    if (!scrollRef.current || isLoading) return

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    const scrollEndThreshold = scrollWidth - clientWidth - (CELL_WIDTH * 2)

    if (scrollLeft >= scrollEndThreshold) {
      setIsLoading(true)
      const lastDate = days[days.length - 1]
      const newDays = Array.from({ length: DAYS_TO_LOAD }, (_, i) =>
        addDays(lastDate, i + 1)
      )
      setDays(prev => [...prev, ...newDays])
      setIsLoading(false)
    }

    const visibleIndex = Math.floor(scrollLeft / CELL_WIDTH)
    const visibleDate = days[visibleIndex]
    if (visibleDate) {
      setCurrentMonth(format(visibleDate, 'MMMM yyyy'))
      setCurrentDate(visibleDate)
    }
  }, [days, isLoading])

  const scrollToToday = useCallback(() => {
    const today = startOfDay(new Date())
    const todayIndex = days.findIndex(date => date.getTime() === today.getTime())
    
    if (todayIndex !== -1 && scrollRef.current) {
      const scrollPosition = todayIndex * CELL_WIDTH
      scrollRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      })
      toast.success("Scrolled to today")
    }
  }, [days])

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (!scrollRef.current) return
    
    const currentPosition = scrollRef.current.scrollLeft
    const daysToScroll = direction === 'next' ? 7 : -7
    const newPosition = currentPosition + (CELL_WIDTH * daysToScroll)
    
    scrollRef.current.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    })
  }

  const handleDateChange = (date: Date) => {
    setCurrentDate(date)
    onDateSelect?.(date)
    
    const dateIndex = days.findIndex(d => d.getTime() === startOfDay(date).getTime())
    if (dateIndex !== -1 && scrollRef.current) {
      const scrollPosition = dateIndex * CELL_WIDTH
      scrollRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      })
    }
  }

  const totalWidth = BAY_COLUMN_WIDTH + (days.length * CELL_WIDTH)

  return (
    <div className={cn("p-4 bg-[#222226] rounded-lg shadow-lg", className)}>
      <CalendarControls
        currentMonth={currentMonth}
        onNavigateMonth={navigateMonth}
        onScrollToToday={scrollToToday}
        currentDate={currentDate}
        onDateChange={handleDateChange}
      />

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={stopDragging}
        className="overflow-x-auto scrollbar-none relative"
        style={{ 
          maxWidth: '100%',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div 
          className="relative"
          style={{
            width: `${totalWidth}px`,
            minWidth: 'max-content'
          }}
        >
          <div className="grid" style={{ gridTemplateColumns: `100px repeat(${days.length}, 80px)` }}>
            <div className="p-4 text-gray-400 font-medium sticky left-0 bg-[#222226] z-10 border-r border-gray-700/50">Bay</div>
            {days.map((date) => {
              const blocked = isDateBlocked(date)
              return (
                <div 
                  key={date.toISOString()}
                  className={cn(
                    "p-4 text-gray-400 font-medium text-center border-b border-r border-gray-700/50",
                    blocked && "bg-red-900/20 cursor-not-allowed"
                  )}
                >
                  <div>{format(date, 'EEE')}</div>
                  <div>{format(date, 'd')}</div>
                </div>
              )
            })}
          </div>

          {serviceBays?.map((bay) => (
            <div 
              key={bay.id}
              className="grid"
              style={{ gridTemplateColumns: `100px repeat(${days.length}, 80px)` }}
            >
              <div className="p-4 text-gray-300 sticky left-0 bg-[#222226] z-10 border-b border-r border-gray-700/50">
                {bay.name}
              </div>
              {days.map((date, index) => {
                const workOrder = findWorkOrderForDate(date, bay.id, workOrders);
                const blocked = isDateBlocked(date)
                
                // Skip rendering empty cells if we're in the middle of a work order span
                if (workOrder && !isWorkOrderStart(date, workOrder)) {
                  return null;
                }
                
                if (workOrder && isWorkOrderStart(date, workOrder)) {
                  const span = getWorkOrderSpan(workOrder, index, days.length);
                  
                  return (
                    <WorkOrderCard
                      key={date.toISOString()}
                      workOrder={workOrder}
                      date={date}
                      span={span}
                      onClick={() => onWorkOrderSelect(workOrder)}
                    />
                  );
                }

                return (
                  <div 
                    key={date.toISOString()}
                    className={cn(
                      "p-2 relative flex items-center justify-center border-b border-r border-gray-700/50",
                      "transition-colors",
                      !blocked && "hover:bg-gray-700/20 cursor-pointer",
                      blocked && "bg-red-900/20 cursor-not-allowed",
                      isToday(date) && "bg-gray-700/20"
                    )}
                    onClick={() => !blocked && onDateSelect?.(date)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {selectedWorkOrder && (
        <WorkOrderDetailsDialog
          workOrder={selectedWorkOrder}
          open={!!selectedWorkOrder}
          onOpenChange={(open) => !open && setSelectedWorkOrder(null)}
        />
      )}
    </div>
  )
}
