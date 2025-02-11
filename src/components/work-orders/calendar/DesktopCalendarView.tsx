
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isAfter, startOfToday } from "date-fns"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { WorkOrder } from "../types"
import { CalendarDay } from "./CalendarDay"
import { MonthPicker } from "./MonthPicker"
import { useState } from "react"
import { BlockedDate } from "./types"

type DesktopCalendarViewProps = {
  currentDate: Date
  workOrders: WorkOrder[]
  onDateChange?: (date: Date) => void
  blockedDates: BlockedDate[]
}

export function DesktopCalendarView({ currentDate, workOrders, onDateChange, blockedDates }: DesktopCalendarViewProps) {
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const today = startOfToday()

  const handlePreviousMonth = () => {
    if (onDateChange) {
      const prevMonth = new Date(currentDate)
      prevMonth.setMonth(prevMonth.getMonth() - 1)
      // Only allow changing to previous month if it's not before today
      if (!isAfter(today, endOfMonth(prevMonth))) {
        onDateChange(prevMonth)
      }
    }
  }

  const handleNextMonth = () => {
    if (onDateChange) {
      const nextMonth = new Date(currentDate)
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      onDateChange(nextMonth)
    }
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  }).filter(date => !isAfter(today, date)) // Only include today and future dates

  return (
    <div className="rounded-lg bg-card/50 p-4">
      <div className="flex items-center justify-between mb-4">
        <Button 
          variant="ghost" 
          onClick={() => setShowMonthPicker(true)}
          className="font-semibold"
        >
          {format(currentDate, 'MMMM yyyy')}
        </Button>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={handlePreviousMonth}
            disabled={isAfter(today, endOfMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-sm font-medium text-muted-foreground text-center py-2">
            {day}
          </div>
        ))}
        {days.map((day) => (
          <CalendarDay
            key={day.toISOString()}
            date={day}
            workOrders={workOrders.filter(wo => {
              if (!wo.start_time) return false
              const startDate = new Date(wo.start_time)
              return isSameDay(day, startDate)
            })}
            isCurrentMonth={isSameMonth(day, currentDate)}
            blockedDates={blockedDates}
          />
        ))}
      </div>

      <MonthPicker
        currentDate={currentDate}
        open={showMonthPicker}
        onOpenChange={setShowMonthPicker}
        onDateChange={onDateChange || (() => {})}
      />
    </div>
  )
}
