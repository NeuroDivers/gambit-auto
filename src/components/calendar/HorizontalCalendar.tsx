
import { useRef, useState, useCallback, useEffect } from "react"
import { format, addDays, startOfDay, isWithinInterval, parseISO, subDays } from "date-fns"
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
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from "lucide-react"
import { MonthPicker } from "@/components/work-orders/calendar/MonthPicker"

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
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const { serviceBays, isLoading: isLoadingBays, refetch: refetchBays } = useServiceBays()
  const { blockedDates } = useBlockedDates()
  const DAYS_TO_LOAD = 14
  const PAST_DAYS = 30  // Show 30 days in the past
  const CELL_WIDTH = 60
  const BAY_COLUMN_WIDTH = 80

  // Force a refetch of service bays when the component mounts
  useEffect(() => {
    refetchBays().catch(error => {
      console.error("Error refetching service bays:", error);
    });
  }, [refetchBays]);

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
    // Create an array with past days, today, and future days
    const pastDays = Array.from({ length: PAST_DAYS }, (_, i) => 
      subDays(startOfDay(new Date()), PAST_DAYS - i)
    )
    
    const futureDays = Array.from({ length: DAYS_TO_LOAD * 2 }, (_, i) =>
      addDays(startOfDay(new Date()), i + 1)
    )
    
    // Combine past, today and future
    const today = startOfDay(new Date())
    const initialDays = [...pastDays, today, ...futureDays]
    
    setDays(initialDays)
  }, [])

  const handleScroll = useCallback(() => {
    if (!scrollRef.current || isLoading) return

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    const scrollEndThreshold = scrollWidth - clientWidth - (CELL_WIDTH * 4)

    if (scrollLeft >= scrollEndThreshold) {
      setIsLoading(true)
      const lastDate = days[days.length - 1]
      const newDays = Array.from({ length: DAYS_TO_LOAD * 2 }, (_, i) =>
        addDays(lastDate, i + 1)
      )
      
      setDays(prev => [...prev, ...newDays])
      setTimeout(() => setIsLoading(false), 100)
    }

    // Also check if we're near the beginning and need to load more past days
    if (scrollLeft < CELL_WIDTH * 4) {
      setIsLoading(true)
      const firstDate = days[0]
      const newPastDays = Array.from({ length: DAYS_TO_LOAD }, (_, i) =>
        subDays(firstDate, DAYS_TO_LOAD - i)
      )
      
      setDays(prev => [...newPastDays, ...prev])
      
      // Keep the scroll position after adding new days
      if (scrollRef.current) {
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollLeft = DAYS_TO_LOAD * CELL_WIDTH + scrollLeft
          }
          setIsLoading(false)
        }, 100)
      }
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
    const daysToScroll = direction === 'next' ? 30 : -30
    const newPosition = currentPosition + (CELL_WIDTH * daysToScroll)
    
    scrollRef.current.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    })
  }

  const scrollDays = (direction: 'prev' | 'next', amount: number = 7) => {
    if (!scrollRef.current) return
    
    const currentPosition = scrollRef.current.scrollLeft
    const scrollAmount = direction === 'next' ? amount : -amount
    const newPosition = currentPosition + (CELL_WIDTH * scrollAmount)
    
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

  if (isLoadingBays) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 border rounded-lg bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading service bays...</p>
      </div>
    );
  }

  return (
    <div className={cn("p-4 bg-white rounded-lg shadow-sm border border-gray-200", className)}>
      <div className="mb-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => scrollDays('prev')}
              className="p-0 w-8 h-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMonthPicker(true)}
              className="min-w-[120px] font-medium text-center"
            >
              {currentMonth}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => scrollDays('next')}
              className="p-0 w-8 h-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={scrollToToday}
              className="text-sm"
            >
              Today
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              title="Previous month"
              className="p-0 w-8 h-8"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              title="Next month"
              className="p-0 w-8 h-8"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {serviceBays && serviceBays.length > 0 ? (
        <div 
          className="relative overflow-hidden w-full border rounded-md"
          style={{ maxWidth: '100%' }}
        >
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
            className="overflow-x-auto relative [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-gray-100 w-full"
            style={{ 
              maxWidth: '100%',
              WebkitOverflowScrolling: 'touch',
              cursor: 'grab'
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
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 space-y-4 border rounded-md bg-muted/10">
          <p className="text-sm text-muted-foreground">No service bays available</p>
          <p className="text-xs text-muted-foreground">Create service bays to use the calendar view</p>
        </div>
      )}

      {selectedWorkOrder && (
        <WorkOrderDetailsDialog
          workOrder={selectedWorkOrder}
          open={!!selectedWorkOrder}
          onOpenChange={(open) => !open && setSelectedWorkOrder(null)}
        />
      )}
      
      <MonthPicker
        currentDate={currentDate}
        open={showMonthPicker}
        onOpenChange={setShowMonthPicker}
        onDateChange={handleDateChange}
      />
    </div>
  )
}
