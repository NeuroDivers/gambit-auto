
import { WorkOrder } from "../../types"
import React, { useState } from "react"
import { HorizontalCalendar } from "@/components/calendar"
import { CreateWorkOrderDialog } from "../../CreateWorkOrderDialog"
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

  return (
    <div className="space-y-4">
      <HorizontalCalendar 
        onDateSelect={handleDateSelect}
        className="border border-border"
        workOrders={workOrders}
      />

      <CreateWorkOrderDialog 
        open={showWorkOrderDialog}
        onOpenChange={setShowWorkOrderDialog}
        defaultStartTime={selectedDate || undefined}
      />
    </div>
  )
}
