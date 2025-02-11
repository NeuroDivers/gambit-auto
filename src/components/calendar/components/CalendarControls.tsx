
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"

interface CalendarControlsProps {
  currentMonth: string
  onNavigateMonth: (direction: 'prev' | 'next') => void
  onScrollToToday: () => void
}

export function CalendarControls({ 
  currentMonth, 
  onNavigateMonth, 
  onScrollToToday 
}: CalendarControlsProps) {
  return (
    <div className="flex items-center justify-between px-2 mb-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => onNavigateMonth('prev')}
          className="hover:bg-accent/50 text-white"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-semibold min-w-[120px] text-center text-white">
          {currentMonth}
        </span>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => onNavigateMonth('next')}
          className="hover:bg-accent/50 text-white"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <Button 
        variant="ghost" 
        size="sm"
        onClick={onScrollToToday}
        className="text-sm flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white"
      >
        <CalendarIcon className="w-4 h-4" />
        Today
      </Button>
    </div>
  )
}
