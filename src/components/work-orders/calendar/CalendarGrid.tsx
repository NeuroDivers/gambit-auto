
import { useMediaQuery } from "@/hooks/use-mobile"
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
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { data: blockedDates = [] } = useBlockedDates()

  const handleClick = (date: Date, e: React.MouseEvent) => {
    // Only handle date clicks if it's not from a button click
    if (!(e.target instanceof HTMLButtonElement)) {
      onDateChange?.(date)
    }
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
