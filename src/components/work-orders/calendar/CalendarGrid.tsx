import * as React from "react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { ServiceBay, WorkOrder } from "../types"

interface CalendarGridProps {
  selectedDate: Date
  serviceBays?: ServiceBay[]
  workOrders: WorkOrder[]
  onSelectDate: (date: Date) => void
}

export function CalendarGrid({ selectedDate, serviceBays = [], workOrders, onSelectDate }: CalendarGridProps) {
  // Create default service bays if none provided
  const defaultBays = [
    { id: '1', name: 'Bay 1', status: 'available' },
    { id: '2', name: 'Bay 2', status: 'available' },
    { id: '3', name: 'Bay 3', status: 'available' }
  ] as ServiceBay[]

  const bays = serviceBays.length > 0 ? serviceBays : defaultBays
  
  const timeSlots = Array.from({ length: 10 }, (_, i) => {
    const hour = 9 + i
    return `${hour.toString().padStart(2, '0')}:00`
  })

  return (
    <div className="grid grid-cols-[auto,1fr,1fr,1fr] gap-4">
      <div className="font-medium">Time</div>
      {bays.map(bay => (
        <div key={bay.id} className="font-medium">
          {bay.name}
          <div className="text-sm text-muted-foreground">
            {format(selectedDate, 'EEEE')}
          </div>
        </div>
      ))}
      {timeSlots.map(time => (
        <React.Fragment key={time}>
          <div className="py-4">{time}</div>
          {bays.map(bay => {
            const workOrder = workOrders.find(
              wo => wo.assigned_bay_id === bay.id && 
                   format(new Date(wo.start_date), 'HH:00') === time
            )

            return (
              <button
                key={bay.id}
                onClick={() => onSelectDate(selectedDate)}
                className={cn(
                  "border-t border-border py-4 text-muted-foreground hover:bg-accent/50 transition-colors",
                  workOrder && "bg-primary/20 hover:bg-primary/30"
                )}
              >
                {workOrder ? (
                  <div className="text-sm">
                    <div className="font-medium text-primary">
                      {workOrder.quote_requests?.first_name} {workOrder.quote_requests?.last_name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {workOrder.quote_requests?.quote_request_services?.[0]?.service_types.name}
                    </div>
                  </div>
                ) : (
                  "Available"
                )}
              </button>
            )
          })}
        </React.Fragment>
      ))}
    </div>
  )
}