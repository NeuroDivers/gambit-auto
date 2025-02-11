
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

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0))
    setScrollLeft(scrollRef.current?.scrollLeft || 0)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - (scrollRef.current.offsetLeft || 0)
    const walk = (x - startX) * 2 // Multiply by 2 for faster scrolling
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  return (
    <ScrollArea 
      ref={scrollRef} 
      className="h-[600px] rounded-md border cursor-grab active:cursor-grabbing"
      onScroll={onScroll}
    >
      <div 
        className="min-w-[800px] select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
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
  )
}
