
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  addDays,
  format
} from "date-fns"
import { CalendarDay } from "./CalendarDay"
import { WorkOrder } from "../types"

interface DesktopCalendarViewProps {
  currentDate: Date
  workOrders: WorkOrder[]
}

export function DesktopCalendarView({ currentDate, workOrders }: DesktopCalendarViewProps) {
  // Get all days in the month and include days from previous/next month to complete the calendar grid
  const firstDayOfMonth = startOfMonth(currentDate)
  const lastDayOfMonth = endOfMonth(currentDate)
  const firstDayOfCalendar = startOfWeek(firstDayOfMonth)
  const lastDayOfCalendar = endOfWeek(lastDayOfMonth)

  // Get all days to display in the calendar
  const calendarDays = eachDayOfInterval({
    start: firstDayOfCalendar,
    end: lastDayOfCalendar,
  })

  // Group work orders by day
  const workOrdersByDay = calendarDays.map(day => {
    const dayWorkOrders = workOrders.filter(workOrder => {
      const startDate = new Date(workOrder.start_time)
      return (
        startDate.getDate() === day.getDate() &&
        startDate.getMonth() === day.getMonth() &&
        startDate.getFullYear() === day.getFullYear()
      )
    })
    return { day, workOrders: dayWorkOrders }
  })

  return (
    <div className="h-full flex flex-col">
      <div className="grid grid-cols-7 bg-background">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="px-4 py-2 text-sm font-medium text-muted-foreground text-center">
            {day}
          </div>
        ))}
      </div>
      <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-card">
        {workOrdersByDay.map(({ day, workOrders }) => (
          <CalendarDay
            key={day.toString()}
            date={day}
            workOrders={workOrders}
            isCurrentMonth={isSameMonth(day, currentDate)}
          />
        ))}
      </div>
    </div>
  )
}
