
import { WorkOrder } from "../../types"
import React, { useState } from "react"
import { HorizontalCalendar } from "@/components/calendar"
import { CreateWorkOrderDialog } from "../../CreateWorkOrderDialog"
import { startOfDay, isWithinInterval, parseISO } from "date-fns"
import { useBlockedDates } from "../hooks/useBlockedDates"
import { MonthPicker } from "@/components/work-orders/calendar/MonthPicker"
import { toast } from "sonner"

type MobileCalendarViewProps = {
  currentDate: Date
  workOrders: WorkOrder[]
  onDateChange?: (date: Date) => void
}

export function MobileCalendarView({ currentDate, workOrders, onDateChange }: MobileCalendarViewProps) {
  const [showWorkOrderDialog, setShowWorkOrderDialog] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const { blockedDates } = useBlockedDates()

  const handleDateSelect = (date: Date) => {
    // Check if the selected date is blocked
    const isBlocked = blockedDates?.some(blocked => 
      isWithinInterval(startOfDay(date), {
        start: parseISO(blocked.start_date),
        end: parseISO(blocked.end_date)
      })
    )

    if (isBlocked) {
      toast.error("This date is blocked and unavailable for bookings")
      return
    }

    setSelectedDate(date)
    setShowWorkOrderDialog(true)
    onDateChange?.(date)
  }

  return (
    <div className="space-y-4">
      <HorizontalCalendar 
        onDateSelect={handleDateSelect}
        className="border border-gray-200 bg-white shadow-sm rounded-lg"
        workOrders={workOrders}
      />

      <CreateWorkOrderDialog 
        open={showWorkOrderDialog}
        onOpenChange={setShowWorkOrderDialog}
        defaultStartTime={selectedDate || undefined}
      />

      <MonthPicker
        currentDate={currentDate}
        open={showMonthPicker}
        onOpenChange={setShowMonthPicker}
        onDateChange={(date) => {
          onDateChange?.(date)
          setShowMonthPicker(false)
        }}
      />
    </div>
  )
}
