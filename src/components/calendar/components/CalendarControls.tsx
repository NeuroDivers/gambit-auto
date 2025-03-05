
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { MonthPicker } from "@/components/work-orders/calendar/MonthPicker"

interface CalendarControlsProps {
  currentMonth: string
  onNavigateMonth: (direction: 'prev' | 'next') => void
  onScrollToToday: () => void
  currentDate: Date
  onDateChange?: (date: Date) => void
}

export function CalendarControls({ 
  currentMonth, 
  onNavigateMonth, 
  onScrollToToday,
  currentDate,
  onDateChange
}: CalendarControlsProps) {
  const [showMonthPicker, setShowMonthPicker] = useState(false)

  return (
    <>
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"  
              size="icon"
              onClick={() => onNavigateMonth('prev')}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <button
              onClick={() => setShowMonthPicker(true)}
              className="font-semibold min-w-[140px] text-center bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md transition-colors"
            >
              {currentMonth}
            </button>
            <Button 
              variant="outline"
              size="icon"
              onClick={() => onNavigateMonth('next')}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            variant="outline"
            size="sm"
            onClick={onScrollToToday}
            className="text-sm flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <CalendarIcon className="w-4 h-4" />
            Today
          </Button>
        </div>
      </div>

      <MonthPicker
        currentDate={currentDate}
        open={showMonthPicker}
        onOpenChange={setShowMonthPicker}
        onDateChange={(date) => {
          onDateChange?.(date)
          setShowMonthPicker(false)
        }}
      />
    </>
  )
}
