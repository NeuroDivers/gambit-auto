
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"

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
    toast.success("Navigated to previous month")
  }

  const handleNextMonth = () => {
    const nextMonth = new Date(currentDate)
    nextMonth.setMonth(currentDate.getMonth() + 1, 1)
    onDateChange(nextMonth)
    toast.success("Navigated to next month")
  }

  const handleResetScroll = async () => {
    try {
      // Navigate to today first
      onTodayClick()
      toast.info("Resetting calendar view...")
      
      // Use RAF for better timing
      requestAnimationFrame(() => {
        if (scrollRef?.current) {
          // Disable smooth scrolling temporarily
          scrollRef.current.style.scrollBehavior = 'auto'
          scrollRef.current.scrollLeft = 0
          
          // Re-enable smooth scrolling after reset
          requestAnimationFrame(() => {
            if (scrollRef?.current) {
              scrollRef.current.style.scrollBehavior = 'smooth'
              toast.success("Calendar view reset successfully")
            }
          })
        }
      })
    } catch (error) {
      toast.error("Failed to reset calendar view")
      console.error("Reset scroll error:", error)
    }
  }

  return (
    <div className="flex items-center justify-between mb-4 px-2">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="icon"
          onClick={handlePreviousMonth}
          className="hover:bg-accent/50"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          onClick={onMonthPickerOpen}
          className="font-semibold min-w-[120px] justify-center"
        >
          {format(currentDate, 'MMMM yyyy')}
        </Button>
        <Button 
          variant="outline" 
          size="icon"
          onClick={handleNextMonth}
          className="hover:bg-accent/50"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onTodayClick}
          className="text-sm flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          Today
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetScroll}
          className="text-sm whitespace-nowrap hover:bg-accent/50"
        >
          Reset Scroll
        </Button>
      </div>
    </div>
  )
}
