
import { format } from "date-fns"
import { ScrollArea } from "@/components/ui/scroll-area"
import { WorkOrder } from "../../types"
import { MobileCalendarRow } from "./MobileCalendarRow"
import React from "react"
import { ServiceBay } from "@/types"

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
  return (
    <ScrollArea 
      ref={scrollRef} 
      className="h-[600px] rounded-md border"
      onScroll={onScroll}
    >
      <div className="min-w-[800px] select-none">
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
