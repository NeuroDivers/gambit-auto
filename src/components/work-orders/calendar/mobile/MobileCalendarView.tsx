
import { WorkOrder } from "../../types"
import React, { useState } from "react"
import { HorizontalCalendar } from "@/components/calendar"
import { CreateWorkOrderDialog } from "../../CreateWorkOrderDialog"
import { useServiceBays } from "@/components/service-bays/hooks/useServiceBays"
import { ScrollArea } from "@/components/ui/scroll-area"
import { WorkOrderCard } from "../../WorkOrderCard"
import { startOfDay, isWithinInterval, parseISO } from "date-fns"
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

  const getWorkOrdersForBay = (bayId: string, date: Date) => {
    return workOrders.filter(order => {
      const orderDate = startOfDay(new Date(order.start_time || ''))
      const targetDate = startOfDay(date)
      return order.bay_id === bayId && orderDate.getTime() === targetDate.getTime()
    })
  }

  return (
    <div className="space-y-4">
      <HorizontalCalendar 
        onDateSelect={handleDateSelect}
        className="border border-border"
      />

      <ScrollArea className="w-full border border-border rounded-lg">
        <div className="min-w-[800px]">
          {/* Bay Headers */}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 p-4 bg-muted/50">
            {serviceBays?.map(bay => (
              <div 
                key={bay.id} 
                className="font-medium text-sm"
              >
                {bay.name}
              </div>
            ))}
          </div>

          {/* Bay Content */}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 p-4">
            {serviceBays?.map(bay => (
              <div key={bay.id} className="space-y-2">
                {getWorkOrdersForBay(bay.id, currentDate).map(order => (
                  <WorkOrderCard
                    key={order.id}
                    workOrder={order}
                    className="bg-card"
                  />
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
