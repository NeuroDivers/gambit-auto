
import { WorkOrder } from "../../types"
import React from "react"
import { MonthPicker } from "../MonthPicker"
import { MobileCalendarHeader } from "./MobileCalendarHeader"
import { MobileCalendarGrid } from "./MobileCalendarGrid"
import { useBlockedDates } from "../hooks/useBlockedDates"
import { MobileCalendarProvider, useMobileCalendar } from "./MobileCalendarProvider"
import { HorizontalCalendar } from "@/components/calendar"

type MobileCalendarViewProps = {
  currentDate: Date
  workOrders: WorkOrder[]
  onDateChange?: (date: Date) => void
}

function MobileCalendarContent({ workOrders }: { workOrders: WorkOrder[] }) {
  const { 
    visibleMonth,
    visibleDays,
    serviceBays,
    scrollRef,
    showMonthPicker,
    handleDateChange,
    setShowMonthPicker,
    scrollToToday
  } = useMobileCalendar()

  const { blockedDates } = useBlockedDates()

  return (
    <div className="space-y-4">
      <MobileCalendarHeader
        currentDate={visibleMonth}
        onDateChange={handleDateChange}
        onMonthPickerOpen={() => setShowMonthPicker(true)}
        onTodayClick={scrollToToday}
        scrollRef={scrollRef}
      />

      <MobileCalendarGrid
        visibleDays={visibleDays}
        workOrders={workOrders}
        serviceBays={serviceBays}
        onScroll={() => {}}
        onDateClick={handleDateChange}
        scrollRef={scrollRef}
        blockedDates={blockedDates}
      />

      <MonthPicker
        open={showMonthPicker}
        onOpenChange={setShowMonthPicker}
        currentDate={visibleMonth}
        onDateChange={handleDateChange}
      />
    </div>
  )
}

export function MobileCalendarView({ currentDate, workOrders, onDateChange }: MobileCalendarViewProps) {
  return (
    <MobileCalendarProvider 
      currentDate={currentDate}
      workOrders={workOrders}
      onDateChange={onDateChange}
    >
      <MobileCalendarContent workOrders={workOrders} />
    </MobileCalendarProvider>
  )
}
