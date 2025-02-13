
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
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"  
              size="icon"
              onClick={() => onNavigateMonth('prev')}
              className="bg-[#9b87f5] hover:bg-[#9b87f5]/90 text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <button
              onClick={() => setShowMonthPicker(true)}
              className="font-semibold min-w-[120px] text-center bg-[#9b87f5] hover:bg-[#9b87f5]/90 text-white px-4 py-2 rounded-md"
            >
              {currentMonth}
            </button>
            <Button 
              variant="outline"
              size="icon"
              onClick={() => onNavigateMonth('next')}
              className="bg-[#9b87f5] hover:bg-[#9b87f5]/90 text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex justify-end px-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={onScrollToToday}
            className="text-sm flex items-center gap-2 bg-[#9b87f5] hover:bg-[#9b87f5]/90 text-white w-full sm:w-auto"
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
