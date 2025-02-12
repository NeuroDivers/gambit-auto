
import { useRef, useState, useCallback, useEffect } from "react"
import { format, addDays, startOfDay, isWithinInterval, parseISO } from "date-fns"
import { cn } from "@/lib/utils"
import { useDragScroll } from "./hooks/useDragScroll"
import { toast } from "sonner"
import { useServiceBays } from "@/components/service-bays/hooks/useServiceBays"
import { WorkOrder } from "../work-orders/types"
import { WorkOrderDetailsDialog } from "../work-orders/calendar/WorkOrderDetailsDialog"
import { CalendarControls } from "./components/CalendarControls"
import { useBlockedDates } from "@/components/work-orders/calendar/hooks/useBlockedDates"
import { CalendarHeader } from "./components/CalendarHeader"
import { CalendarContent } from "./components/CalendarContent"

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
  const CELL_WIDTH = 80
  const BAY_COLUMN_WIDTH = 100

  const isDateBlocked = useCallback((date: Date) => {
    return blockedDates?.some(blocked => 
      isWithinInterval(startOfDay(date), {
        start: parseISO(blocked.start_date),
        end: parseISO(blocked.end_date)
      })
    )
  }, [blockedDates])

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
    <div className={cn("p-4 bg-white rounded-lg", className)}>
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
        className="overflow-x-auto relative [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-gray-100"
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
          <CalendarHeader days={days} isDateBlocked={isDateBlocked} />
          <CalendarContent
            days={days}
            serviceBays={serviceBays}
            workOrders={workOrders}
            isDateBlocked={isDateBlocked}
            onDateSelect={onDateSelect}
            onWorkOrderSelect={setSelectedWorkOrder}
          />
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
