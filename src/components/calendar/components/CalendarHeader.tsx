
import { format } from "date-fns"
import { cn } from "@/lib/utils"

type CalendarHeaderProps = {
  days: Date[]
  isDateBlocked: (date: Date) => boolean
}

export function CalendarHeader({ days, isDateBlocked }: CalendarHeaderProps) {
  return (
    <div className="grid" style={{ gridTemplateColumns: `100px repeat(${days.length}, 80px)` }}>
      <div className="p-4 text-gray-400 font-medium sticky left-0 bg-[#222226] z-10 border-r border-gray-700/50">
        Bay
      </div>
      {days.map((date) => {
        const blocked = isDateBlocked(date)
        return (
          <div 
            key={date.toISOString()}
            className={cn(
              "p-4 text-gray-400 font-medium text-center border-b border-r border-gray-700/50",
              blocked && "bg-red-900/20 cursor-not-allowed"
            )}
          >
            <div>{format(date, 'EEE')}</div>
            <div>{format(date, 'd')}</div>
          </div>
        )
      })}
    </div>
  )
}
