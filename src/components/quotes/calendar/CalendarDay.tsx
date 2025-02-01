import { format } from "date-fns"
import { QuoteRequest } from "../types"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type CalendarDayProps = {
  date: Date
  quotes: QuoteRequest[]
  isCurrentMonth: boolean
}

export function CalendarDay({ date, quotes, isCurrentMonth }: CalendarDayProps) {
  return (
    <div className={cn(
      "min-h-[120px] p-2 border border-border/20 rounded-md",
      !isCurrentMonth && "opacity-50 bg-background/50"
    )}>
      <div className="font-medium text-sm mb-2">
        {format(date, 'd')}
      </div>
      <div className="space-y-1">
        {quotes.map((quote) => (
          <div 
            key={quote.id}
            className="text-xs bg-primary/10 p-1 rounded truncate"
          >
            <Badge variant="outline" className="text-[10px] mb-1">
              {quote.status}
            </Badge>
            <div className="truncate">
              {quote.first_name} {quote.last_name}
            </div>
            <div className="text-muted-foreground truncate">
              {quote.vehicle_make} {quote.vehicle_model}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}