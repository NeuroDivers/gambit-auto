
import { WorkOrder } from "../../types"
import React, { useState } from "react"
import { HorizontalCalendar } from "@/components/calendar"
import { CreateWorkOrderDialog } from "../../CreateWorkOrderDialog"
import { startOfDay, isWithinInterval, parseISO } from "date-fns"
import { useBlockedDates } from "../hooks/useBlockedDates"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { MonthPicker } from "@/components/work-orders/calendar/MonthPicker"

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
      <Button 
        variant="ghost"
        onClick={() => setShowMonthPicker(true)}
        className="text-lg font-semibold hover:bg-accent/50"
      >
        {format(currentDate, 'MMMM yyyy')}
      </Button>

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
