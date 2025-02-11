
import { format, isToday } from "date-fns"
import React from "react"

type CalendarGridHeaderProps = {
  visibleDays: Date[]
  onDateClick: (date: Date, e?: React.MouseEvent) => void
}

export function CalendarGridHeader({ visibleDays, onDateClick }: CalendarGridHeaderProps) {
  return (
    <div className="grid grid-cols-[86px_repeat(30,64px)] gap-4 bg-muted/50 p-2 rounded-t-lg sticky top-0 z-10">
      <div className="text-sm font-medium text-muted-foreground">Bays</div>
      {visibleDays.map((day) => (
        <div 
          key={day.toISOString()} 
          className={`flex flex-col items-center justify-center cursor-pointer hover:bg-accent/50 rounded p-1 ${
            isToday(day) ? 'bg-primary/10 text-primary' : ''
          }`}
          onClick={(e) => onDateClick(day, e)}
        >
          <span className="text-sm font-medium text-muted-foreground">
            {format(day, 'EEE')}
          </span>
          <span className={`text-sm font-bold ${isToday(day) ? 'text-primary' : ''}`}>
            {format(day, 'd')}
          </span>
        </div>
      ))}
    </div>
  )
}
