import { useRef, useState, useEffect, useCallback } from "react"
import { format, addDays, startOfDay, isToday, isSameDay, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, User2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDragScroll } from "./hooks/useDragScroll"
import { toast } from "sonner"
import { useServiceBays } from "@/components/service-bays/hooks/useServiceBays"
import { WorkOrder } from "../work-orders/types"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { WorkOrderDetailsDialog } from "../work-orders/calendar/WorkOrderDetailsDialog"

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
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null)
  const { serviceBays } = useServiceBays()
  const DAYS_TO_LOAD = 14 // Initial load of 14 days

  const {
    handleMouseDown,
    handleMouseMove,
    handleTouchStart,
    handleTouchMove,
    stopDragging,
    isDragging
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
    const scrollEndThreshold = scrollWidth - clientWidth - 400

    if (scrollLeft >= scrollEndThreshold) {
      setIsLoading(true)
      const lastDate = days[days.length - 1]
      const newDays = Array.from({ length: DAYS_TO_LOAD }, (_, i) =>
        addDays(lastDate, i + 1)
      )
      setDays(prev => [...prev, ...newDays])
      setIsLoading(false)
    }

    const visibleIndex = Math.floor(scrollLeft / 200)
    const visibleDate = days[visibleIndex]
    if (visibleDate) {
      setCurrentMonth(format(visibleDate, 'MMMM yyyy'))
    }
  }, [days, isLoading])

  const scrollToToday = useCallback(() => {
    const today = startOfDay(new Date())
    const todayIndex = days.findIndex(date => isSameDay(date, today))
    
    if (todayIndex !== -1 && scrollRef.current) {
      const scrollPosition = todayIndex * 200
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
    const newPosition = currentPosition + (200 * daysToScroll)
    
    scrollRef.current.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    })
  }

  const hasWorkOrder = (date: Date, bayId: string) => {
    return workOrders?.some(order => 
      order.assigned_bay_id === bayId && 
      isSameDay(new Date(order.start_time || ''), date)
    )
  }

  const getWorkOrder = (date: Date, bayId: string) => {
    return workOrders?.find(order => 
      order.assigned_bay_id === bayId && 
      isSameDay(new Date(order.start_time || ''), date)
    )
  }

  const formatTime = (timeString: string | null | undefined) => {
    if (!timeString) return ''
    return format(parseISO(timeString), 'h:mm a')
  }

  const getWorkOrderSpan = (workOrder: WorkOrder) => {
    if (!workOrder.estimated_duration) return 1;
    return parseInt(workOrder.estimated_duration) || 1;
  }

  const isWorkOrderContinuation = (date: Date, bayId: string) => {
    for (let i = 1; i <= 7; i++) {
      const prevDate = addDays(date, -i)
      const workOrder = workOrders?.find(order => 
        order.assigned_bay_id === bayId && 
        isSameDay(new Date(order.start_time || ''), prevDate)
      )
      
      if (workOrder) {
        const duration = getWorkOrderSpan(workOrder)
        const startDate = new Date(workOrder.start_time || '')
        const endDate = addDays(startDate, duration - 1)
        
        if (date >= startDate && date <= endDate) {
          return workOrder
        }
      }
    }
    return null
  }

  return (
    <div className={cn("p-4 bg-[#222226] rounded-lg shadow-lg", className)}>
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
            width: `${(days.length * 200) + 100}px`,
            minWidth: 'max-content'
          }}
        >
          <div className="grid" style={{ gridTemplateColumns: `100px repeat(${days.length}, 200px)` }}>
            <div className="p-4 text-gray-400 font-medium sticky left-0 bg-[#222226] z-10">Bay</div>
            {days.map((date) => (
              <div 
                key={date.toISOString()}
                className="p-4 text-gray-400 font-medium text-center border-b border-gray-700/50"
              >
                <div>{format(date, 'EEE')}</div>
                <div>{format(date, 'd')}</div>
              </div>
            ))}
          </div>

          {serviceBays?.map((bay) => (
            <div 
              key={bay.id}
              className="grid"
              style={{ gridTemplateColumns: `100px repeat(${days.length}, 200px)` }}
            >
              <div className="p-4 text-gray-300 sticky left-0 bg-[#222226] z-10 border-b border-gray-700/50">
                {bay.name}
              </div>
              {days.map((date, index) => {
                const workOrder = getWorkOrder(date, bay.id)
                const continuedWorkOrder = isWorkOrderContinuation(date, bay.id)
                
                if (workOrder) {
                  const duration = getWorkOrderSpan(workOrder)
                  const remainingDays = days.length - index
                  const actualSpan = Math.min(duration, remainingDays)
                  
                  return (
                    <div 
                      key={date.toISOString()}
                      className={cn(
                        "p-2 relative flex items-center border-b border-gray-700/50",
                        "hover:bg-gray-700/20 transition-colors cursor-pointer",
                        isToday(date) && "bg-gray-700/20"
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedWorkOrder(workOrder)
                      }}
                      style={{
                        gridColumn: `span ${actualSpan}`,
                        marginLeft: index === 0 ? '0' : '-2px',
                        marginRight: actualSpan > 1 ? '-2px' : '0',
                      }}
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="bg-[#1F2937] p-2 rounded-lg border border-[#50D091]/20 w-full">
                              <div className="text-xs text-white truncate">
                                {workOrder.first_name} {workOrder.last_name}
                              </div>
                              <div className="text-xs text-[#50D091] mt-1 flex items-center gap-1">
                                <User2 className="w-3 h-3" />
                                <span>{formatTime(workOrder.start_time)}</span>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1">
                              <p className="font-medium">{workOrder.first_name} {workOrder.last_name}</p>
                              <p className="text-sm text-gray-400">
                                {workOrder.vehicle_year} {workOrder.vehicle_make} {workOrder.vehicle_model}
                              </p>
                              <p className="text-sm text-[#50D091]">
                                {formatTime(workOrder.start_time)}
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )
                }
                
                if (continuedWorkOrder) {
                  return <div key={date.toISOString()} className="border-b border-gray-700/50" />
                }

                return (
                  <div 
                    key={date.toISOString()}
                    className={cn(
                      "p-2 relative flex items-center justify-center border-b border-gray-700/50",
                      "hover:bg-gray-700/20 transition-colors cursor-pointer",
                      isToday(date) && "bg-gray-700/20"
                    )}
                    onClick={() => onDateSelect?.(date)}
                  />
                )
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
