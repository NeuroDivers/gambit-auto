
import { useIsMobile } from "@/hooks/use-mobile"
import { DesktopCalendarView } from "./DesktopCalendarView"
import { MobileCalendarView } from "./mobile/MobileCalendarView"
import { WorkOrder } from "../types"
import { useBlockedDates } from "./hooks/useBlockedDates"

type CalendarGridProps = {
  currentDate: Date
  workOrders: WorkOrder[]
  onDateChange?: (date: Date) => void
  onMonthChange: (date: Date) => void
}

export function CalendarGrid({ currentDate, workOrders, onDateChange, onMonthChange }: CalendarGridProps) {
  const isMobile = useIsMobile()
  const { blockedDates = [] } = useBlockedDates()

  if (isMobile) {
    return (
      <MobileCalendarView
        currentDate={currentDate}
        workOrders={workOrders}
        onDateChange={onDateChange}
      />
    )
  }

  return (
    <DesktopCalendarView
      currentDate={currentDate}
      workOrders={workOrders}
      onDateChange={onDateChange}
      onMonthChange={onMonthChange}
      blockedDates={blockedDates}
    />
  )
}
