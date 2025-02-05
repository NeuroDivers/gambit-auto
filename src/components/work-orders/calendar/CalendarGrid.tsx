import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth } from "date-fns"
import { CalendarDay } from "./CalendarDay"
import { WorkOrder } from "../types"

type CalendarGridProps = {
  currentDate: Date
  workOrders: WorkOrder[]
}

export function CalendarGrid({ currentDate, workOrders }: CalendarGridProps) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  })

  const getWorkOrdersForDay = (date: Date) => {
    return workOrders.filter(workOrder => {
      if (!workOrder.start_time) return false
      const orderDate = new Date(workOrder.start_time)
      return (
        orderDate.getDate() === date.getDate() &&
        orderDate.getMonth() === date.getMonth() &&
        orderDate.getFullYear() === date.getFullYear()
      )
    })
  }

  return (
    <div className="grid grid-cols-7 gap-2">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        <div key={day} className="text-sm font-medium text-center py-2">
          {day}
        </div>
      ))}
      {days.map((day) => (
        <CalendarDay
          key={day.toISOString()}
          date={day}
          workOrders={getWorkOrdersForDay(day)}
          isCurrentMonth={isSameMonth(day, currentDate)}
        />
      ))}
    </div>
  )
}