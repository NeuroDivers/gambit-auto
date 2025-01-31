import * as React from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns"
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

  // Get all days in the current month
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(selectedDate),
    end: endOfMonth(selectedDate)
  })

  return (
    <div className="space-y-4">
      <div className="text-xl font-semibold mb-4">
        {format(selectedDate, 'MMMM yyyy')}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="font-medium text-center py-2">
            {day}
          </div>
        ))}
        {daysInMonth.map((date) => {
          const dayWorkOrders = workOrders.filter(
            wo => format(new Date(wo.start_date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
          )

          return (
            <button
              key={date.toString()}
              onClick={() => onSelectDate(date)}
              className={cn(
                "p-2 text-center hover:bg-accent/50 transition-colors min-h-[80px] border rounded-md",
                dayWorkOrders.length > 0 && "bg-primary/20 hover:bg-primary/30"
              )}
            >
              <div className="font-medium">{format(date, 'd')}</div>
              {dayWorkOrders.length > 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  {dayWorkOrders.length} work order{dayWorkOrders.length !== 1 ? 's' : ''}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}