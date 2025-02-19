
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
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrevMonth}
        className="hover:bg-primary/10"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onNextMonth}
        className="hover:bg-primary/10"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </>
  )
}
