
import { useRef, useState, useEffect, useCallback } from "react"
import { format, addDays, startOfDay, isToday, isSameDay } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDragScroll } from "./hooks/useDragScroll"
import { toast } from "sonner"

type HorizontalCalendarProps = {
  onDateSelect?: (date: Date) => void
  className?: string
}

export function HorizontalCalendar({ onDateSelect, className }: HorizontalCalendarProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [days, setDays] = useState<Date[]>([])
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'MMMM yyyy'))
  const [isLoading, setIsLoading] = useState(false)
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
        className={cn(
          "overflow-x-auto snap-x snap-mandatory scroll-smooth",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div 
          className="flex" 
          style={{ minWidth: `${days.length * CELL_WIDTH}px` }}
        >
          {days.map((date) => (
            <div
              key={date.toISOString()}
              className={cn(
                "flex-none w-[100px] h-[100px] p-4 border-r border-border snap-start",
                "hover:bg-accent/50 transition-colors",
                "first:rounded-l-lg last:rounded-r-lg last:border-r-0",
                isToday(date) && "bg-primary/10 font-semibold",
                !isDragging && "cursor-pointer"
              )}
              onClick={(e) => {
                if (!stopDragging(e)) {
                  onDateSelect?.(date)
                }
              }}
            >
              <div className="text-sm text-muted-foreground">
                {format(date, 'EEE')}
              </div>
              <div className={cn(
                "text-2xl",
                isToday(date) && "text-primary"
              )}>
                {format(date, 'd')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
