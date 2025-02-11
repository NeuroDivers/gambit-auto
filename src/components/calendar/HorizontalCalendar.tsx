
import { useRef, useState, useEffect, useCallback } from "react"
import { format, addDays, startOfDay, isToday, isSameDay } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDragScroll } from "./hooks/useDragScroll"
import { toast } from "sonner"
import { useServiceBays } from "@/components/service-bays/hooks/useServiceBays"
import { ScrollArea } from "@/components/ui/scroll-area"
import { WorkOrderCard } from "../work-orders/WorkOrderCard"
import { WorkOrder } from "../work-orders/types"

type HorizontalCalendarProps = {
  onDateSelect?: (date: Date) => void
  className?: string
  workOrders?: WorkOrder[]
}

export function HorizontalCalendar({ onDateSelect, className, workOrders = [] }: HorizontalCalendarProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [days, setDays] = useState<Date[]>([])
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'MMMM yyyy'))
  const [isLoading, setIsLoading] = useState(false)
  const { serviceBays } = useServiceBays()
  const CELL_WIDTH = 100 // Width of each day cell in pixels
  const DAYS_TO_LOAD = 20 // Number of days to load in each batch

  const {
    handleMouseDown,
    handleMouseMove,
    handleTouchStart,
    handleTouchMove,
    stopDragging,
    isDragging
  } = useDragScroll(scrollRef)

  // Initialize calendar with current date and next 20 days
  useEffect(() => {
    const initialDays = Array.from({ length: DAYS_TO_LOAD }, (_, i) =>
      addDays(startOfDay(new Date()), i)
    )
    setDays(initialDays)
  }, [])

  const getWorkOrdersForBay = (bayId: string | null, date: Date) => {
    return workOrders.filter(order => {
      const orderDate = startOfDay(new Date(order.start_time || ''))
      const targetDate = startOfDay(date)
      return order.assigned_bay_id === bayId && orderDate.getTime() === targetDate.getTime()
    })
  }

  // Handle scroll to detect when we need to load more days
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || isLoading) return

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    const scrollEndThreshold = scrollWidth - clientWidth - 200 // 200px before the end

    if (scrollLeft >= scrollEndThreshold) {
      setIsLoading(true)
      const lastDate = days[days.length - 1]
      const newDays = Array.from({ length: DAYS_TO_LOAD }, (_, i) =>
        addDays(lastDate, i + 1)
      )
      setDays(prev => [...prev, ...newDays])
      setIsLoading(false)
    }

    // Update current month based on visible dates
    const visibleIndex = Math.floor(scrollLeft / CELL_WIDTH)
    const visibleDate = days[visibleIndex]
    if (visibleDate) {
      setCurrentMonth(format(visibleDate, 'MMMM yyyy'))
    }
  }, [days, isLoading])

  // Scroll to today's date
  const scrollToToday = useCallback(() => {
    const today = startOfDay(new Date())
    const todayIndex = days.findIndex(date => isSameDay(date, today))
    
    if (todayIndex !== -1 && scrollRef.current) {
      const scrollPosition = todayIndex * CELL_WIDTH
      scrollRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      })
      toast.success("Scrolled to today")
    }
  }, [days])

  // Navigate months
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

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (scrollRef.current) {
        handleScroll()
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [handleScroll])

  return (
    <div className={cn("space-y-4 p-4 bg-gradient-to-b from-background/50 to-background rounded-lg shadow-lg", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigateMonth('prev')}
            className="hover:bg-accent/50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-semibold min-w-[120px] text-center">
            {currentMonth}
          </span>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigateMonth('next')}
            className="hover:bg-accent/50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={scrollToToday}
          className="text-sm flex items-center gap-2"
        >
          <CalendarIcon className="w-4 h-4" />
          Today
        </Button>
      </div>

      {/* Calendar Grid */}
      <ScrollArea className="w-full border border-border rounded-lg">
        <div className="min-w-[800px]">
          {/* Headers with days */}
          <div className="grid grid-cols-[200px_repeat(7,1fr)] gap-4 p-4 bg-muted/50">
            <div className="font-medium text-sm">Bay Name</div>
            {days.slice(0, 7).map(day => (
              <div 
                key={day.toISOString()} 
                className="font-medium text-sm text-center"
              >
                {day.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}
              </div>
            ))}
          </div>

          {/* Rows for each bay */}
          <div className="divide-y divide-border">
            {serviceBays?.map(bay => (
              <div 
                key={bay.id} 
                className="grid grid-cols-[200px_repeat(7,1fr)] gap-4 p-4"
              >
                <div className="font-medium text-sm">{bay.name}</div>
                {days.slice(0, 7).map(day => (
                  <div 
                    key={day.toISOString()} 
                    className="min-h-[100px]"
                    onClick={() => onDateSelect?.(day)}
                  >
                    {getWorkOrdersForBay(bay.id, day).map(order => (
                      <WorkOrderCard
                        key={order.id}
                        request={order}
                        className="bg-card mb-2"
                      />
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
