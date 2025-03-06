
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { isToday } from "date-fns"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Lock } from "lucide-react"

type CalendarHeaderProps = {
  days: Date[]
  isDateBlocked: (date: Date) => boolean
  getBlockedDateReason?: (date: Date) => string | null
  onDateChange?: (date: Date) => void
}

export function CalendarHeader({ days, isDateBlocked, getBlockedDateReason, onDateChange }: CalendarHeaderProps) {
  return (
    <div className="grid sticky top-0 z-10 bg-muted/20 shadow-sm" style={{ gridTemplateColumns: `80px repeat(${days.length}, minmax(60px, 1fr))` }}>
      <div className="p-2 text-gray-600 font-medium sticky left-0 bg-white z-10 border-r border-gray-200 text-sm flex items-center justify-center">
        Bay
      </div>
      {days.map((date) => {
        const blocked = isDateBlocked(date);
        const today = isToday(date);
        const blockedReason = blocked && getBlockedDateReason ? getBlockedDateReason(date) : null;
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        
        const headerContent = (
          <div 
            className={cn(
              "p-2 text-gray-600 font-medium text-center border-b border-r border-gray-200 text-sm",
              isWeekend && "bg-gray-50",
              blocked && "bg-red-50 cursor-not-allowed",
              today && !blocked && "bg-primary/10",
              !blocked && onDateChange && "cursor-pointer hover:bg-gray-50",
              "transition-colors duration-200"
            )}
            onClick={() => !blocked && onDateChange && onDateChange(date)}
          >
            <div className="font-bold">{format(date, 'EEE')}</div>
            <div className={cn(
              "text-center",
              today && !blocked && "text-primary font-semibold rounded-full w-6 h-6 flex items-center justify-center mx-auto bg-primary/10",
              blocked && "text-red-600"
            )}>
              {format(date, 'd')}
            </div>
            <div className="text-xs mt-1 opacity-75">
              {format(date, 'MMM')}
            </div>
          </div>
        );
        
        if (blocked && blockedReason) {
          return (
            <TooltipProvider key={date.toISOString()}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    {headerContent}
                    <Badge variant="destructive" className="absolute top-1 right-1 text-[9px] h-4 px-1">
                      <Lock className="h-3 w-3 mr-0.5" />
                      <span className="sr-only sm:not-sr-only sm:inline">Blocked</span>
                    </Badge>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{blockedReason}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
        
        return (
          <div key={date.toISOString()}>
            {headerContent}
          </div>
        );
      })}
    </div>
  )
}
