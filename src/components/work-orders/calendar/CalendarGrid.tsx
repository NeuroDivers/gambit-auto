
import { useIsMobile } from "@/hooks/use-mobile"
import { DesktopCalendarView } from "./DesktopCalendarView"
import { MobileCalendarView } from "./mobile/MobileCalendarView"
import { WorkOrder } from "../types"
import { useBlockedDates } from "./hooks/useBlockedDates"

type CalendarGridProps = {
  currentDate: Date
  workOrders: WorkOrder[]
  onDateChange?: (date: Date) => void
}

export function CalendarGrid({ currentDate, workOrders, onDateChange }: CalendarGridProps) {
  const isMobile = useIsMobile()
  const { blockedDates = [] } = useBlockedDates()

  const handleClick = (date: Date) => {
    onDateChange?.(date)
  }

  if (isMobile) {
    return (
      <MobileCalendarView
        currentDate={currentDate}
        workOrders={workOrders}
        onDateChange={handleClick}
        blockedDates={blockedDates}
      />
    )
  }

  return (
    <DesktopCalendarView
      currentDate={currentDate}
      workOrders={workOrders}
      onDateChange={handleClick}
      blockedDates={blockedDates}
    />
  )
}
