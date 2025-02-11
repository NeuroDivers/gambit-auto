
import React, { useEffect, useRef, useState } from "react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { WorkOrder } from "../../types"
import { MobileCalendarRow } from "./MobileCalendarRow"
import { ServiceBay } from "@/components/service-bays/hooks/useServiceBays"
import { CreateWorkOrderDialog } from "../../CreateWorkOrderDialog"
import { CalendarGridHeader } from "./grid/CalendarGridHeader"
import { useDragScroll } from "./hooks/useDragScroll"

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
  const [showWorkOrderDialog, setShowWorkOrderDialog] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const dragControls = useDragScroll(scrollRef)

  // Handle scroll events for infinite scrolling
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement
      if (!target) return

      const { scrollLeft, scrollWidth, clientWidth } = target
      const remainingScroll = scrollWidth - (scrollLeft + clientWidth)
      
      if (remainingScroll < 500) {
        console.log('Loading more days...', { remainingScroll, scrollWidth, scrollLeft, clientWidth })
        onScroll()
      }
    }

    const currentRef = scrollRef.current
    if (currentRef) {
      currentRef.addEventListener('scroll', handleScroll)
      return () => {
        currentRef.removeEventListener('scroll', handleScroll)
      }
    }
  }, [onScroll, scrollRef])

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!scrollAreaRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current
    const isAtBottom = scrollHeight - scrollTop <= clientHeight
    const isAtTop = scrollTop === 0

    if ((isAtBottom && e.deltaY > 0) || (isAtTop && e.deltaY < 0)) {
      return
    }

    e.stopPropagation()
  }

  const handleDateClick = (date: Date, e?: React.MouseEvent) => {
    if (e?.target instanceof HTMLElement) {
      const isWorkOrderClick = e.target.closest('.work-order-card')
      if (!isWorkOrderClick) {
        setSelectedDate(date)
        setShowWorkOrderDialog(true)
      }
    }
    onDateClick(date)
  }

  return (
    <ScrollArea 
      ref={scrollAreaRef}
      className="rounded-md border"
      onWheel={handleWheel}
    >
      <div 
        className="w-max overflow-x-auto"
        onMouseDown={dragControls.handleMouseDown}
        onMouseMove={dragControls.handleMouseMove}
        onMouseUp={dragControls.stopDragging}
        onMouseLeave={dragControls.stopDragging}
        onTouchStart={dragControls.handleTouchStart}
        onTouchMove={dragControls.handleTouchMove}
        onTouchEnd={dragControls.stopDragging}
        ref={scrollRef}
      >
        <CalendarGridHeader 
          visibleDays={visibleDays}
          onDateClick={handleDateClick}
        />

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
      <ScrollBar orientation="horizontal" />

      <CreateWorkOrderDialog 
        open={showWorkOrderDialog}
        onOpenChange={setShowWorkOrderDialog}
        defaultStartTime={selectedDate || undefined}
      />
    </ScrollArea>
  )
}
