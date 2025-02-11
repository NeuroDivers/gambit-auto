
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"

type MobileCalendarHeaderProps = {
  currentDate: Date
  onDateChange: (date: Date) => void
  onMonthPickerOpen: () => void
  onTodayClick: () => void
}

export function MobileCalendarHeader({ 
  currentDate, 
  onDateChange, 
  onMonthPickerOpen,
  onTodayClick 
}: MobileCalendarHeaderProps) {
  const handlePreviousMonth = () => {
    const prevMonth = new Date(currentDate)
    prevMonth.setMonth(currentDate.getMonth() - 1, 1) // Set to first day of previous month
    onDateChange(prevMonth)
  }

  const handleNextMonth = () => {
    const nextMonth = new Date(currentDate)
    nextMonth.setMonth(currentDate.getMonth() + 1, 1) // Set to first day of next month
    onDateChange(nextMonth)
  }

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="icon"
          onClick={handlePreviousMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          onClick={onMonthPickerOpen}
          className="font-semibold"
        >
          {format(currentDate, 'MMMM yyyy')}
        </Button>
        <Button 
          variant="outline" 
          size="icon"
          onClick={handleNextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={onTodayClick}
        className="text-sm"
      >
        <Calendar className="w-4 h-4 mr-2" />
        Today
      </Button>
    </div>
  )
}
