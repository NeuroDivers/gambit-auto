
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns"
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

type MonthPickerProps = {
  currentDate: Date
  open: boolean
  onOpenChange: (open: boolean) => void
  onDateChange: (date: Date) => void
}

export function MonthPicker({ currentDate, open, onOpenChange, onDateChange }: MonthPickerProps) {
  const [viewDate, setViewDate] = useState(() => new Date(currentDate))
  
  // Reset view date when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setViewDate(new Date(currentDate))
    }
    onOpenChange(isOpen)
  }
  
  // Navigate months
  const nextMonth = () => {
    setViewDate(addMonths(viewDate, 1))
  }
  
  const prevMonth = () => {
    setViewDate(addMonths(viewDate, -1))
  }
  
  // Generate days for the current month
  const monthStart = startOfMonth(viewDate)
  const monthEnd = endOfMonth(viewDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  
  // Calculate day of week of first day to determine grid start position
  const firstDayOfWeek = monthStart.getDay()
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">Select a date</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              size="icon"
              onClick={prevMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="font-medium text-lg">
              {format(viewDate, 'MMMM yyyy')}
            </div>
            
            <Button 
              variant="outline"
              size="icon"
              onClick={nextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-sm">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="h-8 flex items-center justify-center text-muted-foreground font-medium">
                {day}
              </div>
            ))}
            
            {/* Empty cells for previous month */}
            {Array.from({ length: firstDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="h-10" />
            ))}
            
            {/* Days of current month */}
            {days.map(day => {
              const isSelected = isSameDay(day, currentDate)
              const isTodayDate = isToday(day)
              
              return (
                <Button
                  key={day.toISOString()}
                  onClick={() => {
                    onDateChange(day)
                    onOpenChange(false)
                  }}
                  variant={isSelected ? "default" : isTodayDate ? "outline" : "ghost"}
                  className={cn(
                    "h-10 w-full rounded-md",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
                    isTodayDate && !isSelected && "border border-primary text-primary font-medium"
                  )}
                >
                  {format(day, 'd')}
                </Button>
              )
            })}
          </div>
          
          <div className="flex justify-center mt-4">
            <Button 
              onClick={() => {
                const today = new Date()
                onDateChange(today)
                onOpenChange(false)
              }}
              variant="outline"
              className="w-full"
            >
              Today
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
