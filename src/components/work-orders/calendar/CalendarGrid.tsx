import * as React from "react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { ServiceBay } from "../types"

interface CalendarGridProps {
  selectedDate: Date
  serviceBays?: ServiceBay[]
}

export function CalendarGrid({ selectedDate, serviceBays = [] }: CalendarGridProps) {
  const timeSlots = Array.from({ length: 10 }, (_, i) => {
    const hour = 9 + i
    return `${hour.toString().padStart(2, '0')}:00`
  })

  return (
    <div className="grid grid-cols-[auto,1fr,1fr,1fr] gap-4">
      <div className="font-medium">Time</div>
      {serviceBays?.map(bay => (
        <div key={bay.id} className="font-medium">
          {bay.name}
          <div className="text-sm text-muted-foreground">
            {format(selectedDate || new Date(), 'EEEE')}
          </div>
        </div>
      ))}
      {timeSlots.map(time => (
        <React.Fragment key={time}>
          <div className="py-4">{time}</div>
          {serviceBays?.map(bay => (
            <div
              key={bay.id}
              className="border-t border-border py-4 text-muted-foreground"
            >
              Available
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  )
}