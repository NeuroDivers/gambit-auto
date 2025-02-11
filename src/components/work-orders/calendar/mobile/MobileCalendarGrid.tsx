
import { format } from "date-fns"
import { ScrollArea } from "@/components/ui/scroll-area"
import { WorkOrder } from "../../types"
import { MobileCalendarRow } from "./MobileCalendarRow"
import React, { useState, useRef } from "react"
import { ServiceBay } from "@/components/service-bays/hooks/useServiceBays"

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

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0))
    setScrollLeft(scrollRef.current?.scrollLeft || 0)
    setDragStartTime(Date.now())
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    const x = e.pageX - (scrollRef.current.offsetLeft || 0)
    const walk = (x - startX)
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
    setDragStartTime(Date.now())
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollRef.current) return
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft
    const walk = (x - startX)
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  const stopDragging = () => {
    const dragDuration = Date.now() - dragStartTime
    setIsDragging(false)
    // If the drag duration is very short, treat it as a click
    if (dragDuration < 150) {
      return false // Allow click events to propagate
    }
    return true // Prevent click events
  }

  return (
    <div className="overflow-hidden">
      <ScrollArea 
        ref={scrollRef} 
        className="h-[600px] rounded-md border"
        onScroll={onScroll}
      >
        <div 
          className="min-w-[800px] select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={stopDragging}
          onMouseLeave={stopDragging}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={stopDragging}
        >
          <div className="grid grid-cols-[86px_repeat(7,64px)] gap-4 bg-muted/50 p-2 rounded-t-lg sticky top-0 z-10">
            <div className="text-sm font-medium text-muted-foreground">Bays</div>
            {visibleDays.slice(0, 7).map((day) => (
              <div 
                key={day.toISOString()} 
                className="text-sm font-medium text-muted-foreground text-center cursor-pointer hover:bg-accent/50 rounded p-1"
                onClick={() => onDateClick(day)}
              >
                {format(day, 'EEE d')}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-[86px_repeat(7,64px)] gap-4">
            {serviceBays.map((bay) => (
              <React.Fragment key={bay.id}>
                <MobileCalendarRow
                  bayId={bay.id}
                  bayName={bay.name}
                  visibleDays={visibleDays}
                  workOrders={workOrders}
                  onDateClick={onDateClick}
                />
              </React.Fragment>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
