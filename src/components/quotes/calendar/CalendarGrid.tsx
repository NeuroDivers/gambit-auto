import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth } from "date-fns"
import { CalendarDay } from "./CalendarDay"
import { QuoteRequest } from "../types"

type CalendarGridProps = {
  currentDate: Date
  quotes: QuoteRequest[]
}

export function CalendarGrid({ currentDate, quotes }: CalendarGridProps) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  })

  const getQuotesForDay = (date: Date) => {
    return quotes.filter(quote => {
      const quoteDate = new Date(quote.created_at)
      return (
        quoteDate.getDate() === date.getDate() &&
        quoteDate.getMonth() === date.getMonth() &&
        quoteDate.getFullYear() === date.getFullYear()
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
          quotes={getQuotesForDay(day)}
          isCurrentMonth={isSameMonth(day, currentDate)}
        />
      ))}
    </div>
  )
}