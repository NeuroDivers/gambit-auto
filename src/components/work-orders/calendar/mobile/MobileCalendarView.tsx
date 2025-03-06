
import { WorkOrder } from "../../types"
import React, { useState } from "react"
import { HorizontalCalendar } from "@/components/calendar"
import { CreateWorkOrderDialog } from "../../CreateWorkOrderDialog"
import { startOfDay, isWithinInterval, parseISO, format } from "date-fns"
import { useBlockedDates } from "../hooks/useBlockedDates"
import { MonthPicker } from "@/components/work-orders/calendar/MonthPicker"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarClock, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"

type MobileCalendarViewProps = {
  currentDate: Date
  workOrders: WorkOrder[]
  onDateChange?: (date: Date) => void
}

export function MobileCalendarView({ currentDate, workOrders, onDateChange }: MobileCalendarViewProps) {
  const [showWorkOrderDialog, setShowWorkOrderDialog] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const { blockedDates } = useBlockedDates()
  
  const currentMonthYear = format(currentDate, "MMMM yyyy")

  const handleDateSelect = (date: Date) => {
    // Check if the selected date is blocked
    const isBlocked = blockedDates?.some(blocked => 
      isWithinInterval(startOfDay(date), {
        start: parseISO(blocked.start_date),
        end: parseISO(blocked.end_date)
      })
    )

    if (isBlocked) {
      toast.error("This date is blocked and unavailable for bookings")
      return
    }

    setSelectedDate(date)
    setShowWorkOrderDialog(true)
    onDateChange?.(date)
  }

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="pb-2 space-y-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarClock className="h-5 w-5 text-primary" />
            Schedule Calendar
          </CardTitle>
          
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowMonthPicker(true)}
              className="font-medium px-2 text-sm"
            >
              {currentMonthYear}
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onDateChange?.(new Date())}
            className="text-xs"
          >
            <CalendarIcon className="h-3 w-3 mr-1" />
            Today
          </Button>
          
          <div className="flex items-center bg-muted rounded-md">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={() => {
                if (onDateChange) {
                  const newDate = new Date(currentDate);
                  newDate.setDate(newDate.getDate() - 7);
                  onDateChange(newDate);
                }
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={() => {
                if (onDateChange) {
                  const newDate = new Date(currentDate);
                  newDate.setDate(newDate.getDate() + 7);
                  onDateChange(newDate);
                }
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <HorizontalCalendar 
          onDateSelect={handleDateSelect}
          className="border-none shadow-none p-0"
          workOrders={workOrders}
        />

        <CreateWorkOrderDialog 
          open={showWorkOrderDialog}
          onOpenChange={setShowWorkOrderDialog}
          defaultStartTime={selectedDate || undefined}
        />

        <MonthPicker
          currentDate={currentDate}
          open={showMonthPicker}
          onOpenChange={setShowMonthPicker}
          onDateChange={(date) => {
            onDateChange?.(date)
            setShowMonthPicker(false)
          }}
        />
      </CardContent>
    </Card>
  )
}
