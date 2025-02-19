
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

type CalendarHeaderProps = {
  currentDate: Date
  onPrevMonth: () => void
  onNextMonth: () => void
}

export function CalendarHeader({ currentDate, onPrevMonth, onNextMonth }: CalendarHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={onPrevMonth}
        className="hover:bg-primary/10"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <h2 className="text-xl font-semibold text-foreground hover:text-primary cursor-pointer">
        {format(currentDate, 'MMMM yyyy')}
      </h2>
      
      <Button
        variant="outline"
        size="icon"
        onClick={onNextMonth}
        className="hover:bg-primary/10"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
