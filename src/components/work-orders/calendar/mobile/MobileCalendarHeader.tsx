
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"

type MobileCalendarHeaderProps = {
  currentDate: Date
  onDateChange: (date: Date) => void
  onMonthPickerOpen: () => void
  onTodayClick: () => void
  scrollRef?: React.RefObject<HTMLDivElement>
}

export function MobileCalendarHeader({ 
  currentDate, 
  onDateChange, 
  onMonthPickerOpen,
  onTodayClick,
  scrollRef
}: MobileCalendarHeaderProps) {
  const handlePreviousMonth = () => {
    const prevMonth = new Date(currentDate)
    prevMonth.setMonth(currentDate.getMonth() - 1, 1)
    onDateChange(prevMonth)
  }

  const handleNextMonth = () => {
    const nextMonth = new Date(currentDate)
    nextMonth.setMonth(currentDate.getMonth() + 1, 1)
    onDateChange(nextMonth)
  }

  // Modified reset scroll handler with improved timing
  const handleResetScroll = async () => {
    // Navigate to today first
    onTodayClick()
    
    // Use a Promise to ensure better timing control
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Reset scroll position
    if (scrollRef?.current) {
      scrollRef.current.style.scrollBehavior = 'auto'
      scrollRef.current.scrollLeft = 0
      
      // Restore smooth scrolling
      setTimeout(() => {
        if (scrollRef?.current) {
          scrollRef.current.style.scrollBehavior = 'smooth'
        }
      }, 50)
    }
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
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onTodayClick}
          className="text-sm"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Today
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetScroll}
          className="text-sm whitespace-nowrap"
        >
          Reset Scroll
        </Button>
      </div>
    </div>
  )
}
