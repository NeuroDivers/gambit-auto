
import { WorkOrder } from "../../types"
import React, { useState } from "react"
import { HorizontalCalendar } from "@/components/calendar"
import { CreateWorkOrderDialog } from "../../CreateWorkOrderDialog"
import { useServiceBays } from "@/components/service-bays/hooks/useServiceBays"
import { ScrollArea } from "@/components/ui/scroll-area"
import { WorkOrderCard } from "../../WorkOrderCard"
import { startOfDay, isWithinInterval, parseISO, addDays } from "date-fns"
import { useBlockedDates } from "../hooks/useBlockedDates"

type MobileCalendarViewProps = {
  currentDate: Date
  workOrders: WorkOrder[]
  onDateChange?: (date: Date) => void
}

export function MobileCalendarView({ currentDate, workOrders, onDateChange }: MobileCalendarViewProps) {
  const [showWorkOrderDialog, setShowWorkOrderDialog] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const { serviceBays } = useServiceBays()
  const { blockedDates } = useBlockedDates()

  const handleDateSelect = (date: Date) => {
    const isBlocked = blockedDates?.some(blocked => 
      isWithinInterval(date, {
        start: parseISO(blocked.start_date),
        end: parseISO(blocked.end_date)
      })
    )

    if (isBlocked) return

    setSelectedDate(date)
    setShowWorkOrderDialog(true)
    onDateChange?.(date)
  }

  const getWorkOrdersForBay = (bayId: string | null, date: Date) => {
    return workOrders.filter(order => {
      const orderDate = startOfDay(new Date(order.start_time || ''))
      const targetDate = startOfDay(date)
      return order.assigned_bay_id === bayId && orderDate.getTime() === targetDate.getTime()
    })
  }

  // Generate array of next 7 days
  const days = Array.from({ length: 7 }, (_, i) => addDays(currentDate, i))

  return (
    <div className="space-y-4">
      <HorizontalCalendar 
        onDateSelect={handleDateSelect}
        className="border border-border"
      />

      <ScrollArea className="w-full border border-border rounded-lg">
        <div className="min-w-[800px]">
          {/* Headers with days */}
          <div className="grid grid-cols-[200px_repeat(7,1fr)] gap-4 p-4 bg-muted/50">
            <div className="font-medium text-sm">Bay Name</div>
            {days.map(day => (
              <div 
                key={day.toISOString()} 
                className="font-medium text-sm text-center"
              >
                {day.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}
              </div>
            ))}
          </div>

          {/* Rows for each bay */}
          <div className="divide-y divide-border">
            {serviceBays?.map(bay => (
              <div 
                key={bay.id} 
                className="grid grid-cols-[200px_repeat(7,1fr)] gap-4 p-4"
              >
                <div className="font-medium text-sm">{bay.name}</div>
                {days.map(day => (
                  <div key={day.toISOString()} className="min-h-[100px]">
                    {getWorkOrdersForBay(bay.id, day).map(order => (
                      <WorkOrderCard
                        key={order.id}
                        request={order}
                        className="bg-card mb-2"
                      />
                    ))}
                  </div>
                ))}
              </div>
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
