
import { format } from "date-fns"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { WorkOrder } from "../../types"
import { MobileCalendarRow } from "./MobileCalendarRow"
import React, { useState, useEffect, useRef } from "react"
import { ServiceBay } from "@/components/service-bays/hooks/useServiceBays"
import { CreateWorkOrderDialog } from "../../CreateWorkOrderDialog"

type MobileCalendarGridProps = {
  visibleDays: Date[]
  workOrders: WorkOrder[]
  serviceBays: ServiceBay[]
  onScroll: () => void
  onDateClick: (date: Date) => void
  scrollRef: React.RefObject<HTMLDivElement>
}

export function MobileCalendarGrid({ 
  visibleDays, 
  workOrders, 
  serviceBays, 
  onScroll,
  onDateClick,
  scrollRef 
}: MobileCalendarGridProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [dragStartTime, setDragStartTime] = useState(0)
  const [showWorkOrderDialog, setShowWorkOrderDialog] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Handle scroll events for both horizontal and vertical scrolling
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement
      if (!target) return

      const { scrollLeft, scrollWidth, clientWidth } = target
      if (scrollWidth - (scrollLeft + clientWidth) < 200) {
        onScroll()
      }
    }

    const currentRef = scrollRef.current
    if (currentRef) {
      currentRef.addEventListener('scroll', handleScroll)
      return () => currentRef.removeEventListener('scroll', handleScroll)
    }
  }, [onScroll, scrollRef])

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!scrollAreaRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current
    const isAtBottom = scrollHeight - scrollTop <= clientHeight
    const isAtTop = scrollTop === 0

    // Allow page scrolling when at boundaries
    if ((isAtBottom && e.deltaY > 0) || (isAtTop && e.deltaY < 0)) {
      return // Let the event propagate to enable page scrolling
    }

    // Otherwise, prevent propagation to keep scrolling within the calendar
    e.stopPropagation()
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setStartX(e.pageX)
    setScrollLeft(scrollRef.current.scrollLeft)
    setDragStartTime(Date.now())
    e.preventDefault()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX
    const walk = (startX - x) * 2
    scrollRef.current.scrollLeft = scrollLeft + walk
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setStartX(e.touches[0].pageX)
    setScrollLeft(scrollRef.current.scrollLeft)
    setDragStartTime(Date.now())
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollRef.current) return
    const x = e.touches[0].pageX
    const walk = (startX - x) * 2
    scrollRef.current.scrollLeft = scrollLeft + walk
  }

  const stopDragging = (e?: React.MouseEvent | React.TouchEvent) => {
    const dragDuration = Date.now() - dragStartTime
    setIsDragging(false)

    if (dragDuration < 150) {
      return false
    }
    
    if (e) {
      e.preventDefault()
    }
    return true
  }

  const handleDateClick = (date: Date, e?: React.MouseEvent) => {
    if (e?.target instanceof HTMLElement) {
      const isWorkOrderClick = e.target.closest('.work-order-card')
      if (!isWorkOrderClick) {
        setSelectedDate(date)
        setShowWorkOrderDialog(true)
      }
    }
  }

  return (
    <div className="overflow-hidden">
      <ScrollArea 
        ref={scrollAreaRef}
        className="max-h-[600px] rounded-md border scrollbar-hide"
        onWheel={handleWheel}
      >
        <div 
          className="min-w-[2000px] select-none touch-pan-x overflow-x-auto scrollbar-hide"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={stopDragging}
          onMouseLeave={stopDragging}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={stopDragging}
          ref={scrollRef}
        >
          <div className="grid grid-cols-[86px_repeat(30,64px)] gap-4 bg-muted/50 p-2 rounded-t-lg sticky top-0 z-10">
            <div className="text-sm font-medium text-muted-foreground">Bays</div>
            {visibleDays.map((day) => (
              <div 
                key={day.toISOString()} 
                className="text-sm font-medium text-muted-foreground text-center cursor-pointer hover:bg-accent/50 rounded p-1"
                onClick={(e) => handleDateClick(day, e)}
              >
                {format(day, 'EEE d')}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-[86px_repeat(30,64px)] gap-4">
            {serviceBays.map((bay) => (
              <React.Fragment key={bay.id}>
                <MobileCalendarRow
                  bayId={bay.id}
                  bayName={bay.name}
                  visibleDays={visibleDays}
                  workOrders={workOrders}
                  onDateClick={handleDateClick}
                />
              </React.Fragment>
            ))}
          </div>
        </div>
      </ScrollArea>

      <CreateWorkOrderDialog 
        open={showWorkOrderDialog}
        onOpenChange={setShowWorkOrderDialog}
        defaultStartTime={selectedDate || undefined}
      />
    </div>
  )
}
