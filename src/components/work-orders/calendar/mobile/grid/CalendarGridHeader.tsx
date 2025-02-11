
import React from "react"
import { format, isToday, parseISO, isWithinInterval } from "date-fns"
import { BlockedDate } from "../../types"

type CalendarGridHeaderProps = {
  visibleDays: Date[]
  onDateClick: (date: Date, e?: React.MouseEvent) => void
  blockedDates?: BlockedDate[]
}

export function CalendarGridHeader({ visibleDays, onDateClick, blockedDates = [] }: CalendarGridHeaderProps) {
  const isDateBlocked = (date: Date) => {
    return blockedDates.some(blockedDate => {
      if (!blockedDate.start_date || !blockedDate.end_date) return false;
      const start = parseISO(blockedDate.start_date)
      const end = parseISO(blockedDate.end_date)
      return isWithinInterval(date, { start, end })
    })
  }

  return (
    <div className="grid grid-cols-[86px_repeat(30,64px)] bg-muted/50 p-2 rounded-t-lg sticky top-0 z-10">
      <div className="sticky left-0 z-20 bg-muted/50 text-sm font-medium text-muted-foreground">Bays</div>
      {visibleDays.map((day) => {
        const blocked = isDateBlocked(day)
        return (
          <div 
            key={format(day, 'yyyy-MM-dd')} 
            className={`flex flex-col items-center justify-center cursor-pointer hover:bg-accent/50 rounded p-1 ${
              isToday(day) ? 'bg-primary/10 text-primary' : ''
            } ${blocked ? 'bg-destructive/20' : ''}`}
            onClick={(e) => onDateClick(day, e)}
          >
            <span className={`text-sm font-medium ${blocked ? 'text-destructive' : 'text-muted-foreground'}`}>
              {format(day, 'EEE')}
            </span>
            <span className={`text-sm font-bold ${
              isToday(day) ? 'text-primary' : ''
            } ${blocked ? 'text-destructive' : ''}`}>
              {format(day, 'd')}
            </span>
          </div>
        )
      })}
    </div>
  )
}
