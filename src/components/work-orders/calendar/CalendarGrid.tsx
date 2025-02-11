
import { WorkOrder } from "../types"
import { useBlockedDates } from "./hooks/useBlockedDates"
import { useIsMobile } from "@/hooks/use-mobile"
import { MobileCalendarView } from "@/components/work-orders/calendar/mobile/MobileCalendarView"  // Fixed import path
import { DesktopCalendarView } from "./DesktopCalendarView"

type CalendarGridProps = {
  currentDate: Date
  workOrders: WorkOrder[]
  onDateChange?: (date: Date) => void
}

export function CalendarGrid({ currentDate, workOrders, onDateChange }: CalendarGridProps) {
  const isMobile = useIsMobile()
  const { blockedDates } = useBlockedDates()

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
      blockedDates={blockedDates}
    />
  )
}
