
import { WorkOrder } from "../types"
import { useBlockedDates } from "./hooks/useBlockedDates"
import { useIsMobile } from "@/hooks/use-mobile"
import { MobileCalendarView } from "@/components/work-orders/calendar/mobile/MobileCalendarView"
import { DesktopCalendarView } from "./DesktopCalendarView"
import { startOfToday } from "date-fns"

type CalendarGridProps = {
  currentDate: Date
  workOrders: WorkOrder[]
  onDateChange?: (date: Date) => void
}

export function CalendarGrid({ currentDate, workOrders, onDateChange }: CalendarGridProps) {
  const isMobile = useIsMobile()
  const { blockedDates } = useBlockedDates()
  
  // Ensure currentDate is not in the past
  const today = startOfToday()
  const effectiveDate = currentDate < today ? today : currentDate

  console.log("Calendar Grid Props:", { 
    currentDate: effectiveDate, 
    workOrdersCount: workOrders.length,
    workOrders
  })

  if (isMobile) {
    return (
      <MobileCalendarView
        currentDate={effectiveDate}
        workOrders={workOrders}
        onDateChange={onDateChange}
      />
    )
  }

  return (
    <DesktopCalendarView
      date={effectiveDate}
      workOrders={workOrders}
      onDateSelect={onDateChange}
    />
  )
}
