
import { format } from "date-fns"
import { cn } from "@/lib/utils"

type CalendarHeaderProps = {
  days: Date[]
  isDateBlocked: (date: Date) => boolean
}

export function CalendarHeader({ days, isDateBlocked }: CalendarHeaderProps) {
  return (
    <div className="grid" style={{ gridTemplateColumns: `80px repeat(${days.length}, 60px)` }}>
      <div className="p-2 text-gray-400 font-medium sticky left-0 bg-[#222226] z-10 border-r border-gray-700/50 text-sm">
        Bay
      </div>
      {days.map((date) => {
        const blocked = isDateBlocked(date)
        return (
          <div 
            key={date.toISOString()}
            className={cn(
              "p-2 text-gray-400 font-medium text-center border-b border-r border-gray-700/50 text-sm",
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
