
import { WorkOrder } from "../../types"
import React, { useState } from "react"
import { HorizontalCalendar } from "@/components/calendar"
import { CreateWorkOrderDialog } from "../../CreateWorkOrderDialog"

type MobileCalendarViewProps = {
  currentDate: Date
  workOrders: WorkOrder[]
  onDateChange?: (date: Date) => void
}

export function MobileCalendarView({ currentDate, workOrders, onDateChange }: MobileCalendarViewProps) {
  const [showWorkOrderDialog, setShowWorkOrderDialog] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setShowWorkOrderDialog(true)
    onDateChange?.(date)
  }

  return (
    <div className="space-y-4">
      <HorizontalCalendar 
        onDateSelect={handleDateSelect}
        className="border border-border"
      />

      <CreateWorkOrderDialog 
        open={showWorkOrderDialog}
        onOpenChange={setShowWorkOrderDialog}
        defaultStartTime={selectedDate || undefined}
      />
    </div>
  )
}
