
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { isToday } from "date-fns"

type CalendarHeaderProps = {
  days: Date[]
  isDateBlocked: (date: Date) => boolean
}

export function CalendarHeader({ days, isDateBlocked }: CalendarHeaderProps) {
  return (
    <div className="grid" style={{ gridTemplateColumns: `80px repeat(${days.length}, minmax(60px, 1fr))` }}>
      <div className="p-2 text-gray-600 font-medium sticky left-0 bg-white z-10 border-r border-gray-200 text-sm">
        Bay
      </div>
      {days.map((date) => {
        const blocked = isDateBlocked(date);
        const today = isToday(date);
        
        return (
          <div 
            key={date.toISOString()}
            className={cn(
              "p-2 text-gray-600 font-medium text-center border-b border-r border-gray-200 text-sm",
              blocked && "bg-red-50 cursor-not-allowed",
              today && "bg-primary/10"
            )}
          >
            <div className="font-bold">{format(date, 'EEE')}</div>
            <div className={cn(today && "text-primary font-semibold rounded-full w-6 h-6 flex items-center justify-center mx-auto")}>
              {format(date, 'd')}
            </div>
          </div>
        )
      })}
    </div>
  )
}
