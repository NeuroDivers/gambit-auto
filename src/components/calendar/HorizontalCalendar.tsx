
import { useRef, useState, useEffect, useCallback } from "react"
import { format, addDays, startOfDay, isToday, isSameDay } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDragScroll } from "./hooks/useDragScroll"
import { toast } from "sonner"
import { useServiceBays } from "@/components/service-bays/hooks/useServiceBays"
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
  const DAYS_TO_LOAD = 20

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

  // Handle scroll to detect when we need to load more days
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || isLoading) return

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    const scrollEndThreshold = scrollWidth - clientWidth - 200

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
    const visibleIndex = Math.floor(scrollLeft / 200) // Adjusted for new width
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
      const scrollPosition = todayIndex * 200 // Adjusted for new width
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
    const daysToScroll = direction === 'next' ? 7 : -7
    const newPosition = currentPosition + (200 * daysToScroll) // Adjusted for new width
    
    scrollRef.current.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    })
  }

  const hasWorkOrder = (date: Date, bayId: string) => {
    return workOrders?.some(order => 
      order.bay_id === bayId && 
      isSameDay(new Date(order.start_time || ''), date)
    )
  }

  return (
    <div className={cn("p-4 bg-[#222226] rounded-lg shadow-lg", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-2 mb-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigateMonth('prev')}
            className="hover:bg-accent/50 text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-semibold min-w-[120px] text-center text-white">
            {currentMonth}
          </span>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigateMonth('next')}
            className="hover:bg-accent/50 text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={scrollToToday}
          className="text-sm flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white"
        >
          <CalendarIcon className="w-4 h-4" />
          Today
        </Button>
      </div>

      {/* Calendar Grid */}
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
        className="overflow-x-auto scrollbar-none"
      >
        <div className="min-w-max">
          {/* Days header */}
          <div className="grid grid-cols-[100px_repeat(7,200px)] border-b border-gray-700/50">
            <div className="p-4 text-gray-400 font-medium">Bay</div>
            {days.slice(0, 7).map((date) => (
              <div 
                key={date.toISOString()}
                className="p-4 text-gray-400 font-medium text-center"
              >
                <div>{format(date, 'EEE')}</div>
                <div>{format(date, 'd')}</div>
              </div>
            ))}
          </div>

          {/* Bays and events grid */}
          {serviceBays?.map((bay) => (
            <div 
              key={bay.id}
              className="grid grid-cols-[100px_repeat(7,200px)] border-b border-gray-700/50 last:border-b-0"
            >
              <div className="p-4 text-gray-300">{bay.name}</div>
              {days.slice(0, 7).map((date) => (
                <div 
                  key={date.toISOString()}
                  className={cn(
                    "p-4 relative flex items-center justify-center",
                    "hover:bg-gray-700/20 transition-colors cursor-pointer",
                    isToday(date) && "bg-gray-700/20"
                  )}
                  onClick={() => onDateSelect?.(date)}
                >
                  {hasWorkOrder(date, bay.id) && (
                    <div className="w-3 h-3 rounded-full bg-[#50D091]" />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
