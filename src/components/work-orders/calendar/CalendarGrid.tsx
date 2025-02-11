
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, format, addDays } from "date-fns"
import { CalendarDay } from "./CalendarDay"
import { WorkOrder } from "../types"
import { useBlockedDates } from "./hooks/useBlockedDates"
import { useIsMobile } from "@/hooks/use-mobile"
import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"

type CalendarGridProps = {
  currentDate: Date
  workOrders: WorkOrder[]
}

export function CalendarGrid({ currentDate, workOrders }: CalendarGridProps) {
  const isMobile = useIsMobile()
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const { blockedDates } = useBlockedDates()

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  })

  const getWorkOrdersForDay = (date: Date) => {
    return workOrders.filter(workOrder => {
      if (!workOrder.start_time) return false
      const orderDate = new Date(workOrder.start_time)
      return (
        orderDate.getDate() === date.getDate() &&
        orderDate.getMonth() === date.getMonth() &&
        orderDate.getFullYear() === date.getFullYear()
      )
    })
  }

  if (isMobile) {
    // Show 7 days starting from current date for mobile view
    const mobileDays = Array.from({ length: 7 }, (_, i) => addDays(currentDate, i))
    const serviceBays = ["Bay 1", "Bay 2", "Bay 3", "Bay 4", "Bay 5"]

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => setShowMonthPicker(true)}
            className="font-semibold"
          >
            {format(currentDate, 'MMMM yyyy')}
          </Button>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header with days */}
            <div className="grid grid-cols-[120px_repeat(7,1fr)] gap-4 bg-muted/50 p-2 rounded-t-lg">
              <div className="text-sm font-medium text-muted-foreground">Bays</div>
              {mobileDays.map((day) => (
                <div key={day.toISOString()} className="text-sm font-medium text-muted-foreground text-center">
                  {format(day, 'EEE d')}
                </div>
              ))}
            </div>

            {/* Grid with bays and time slots */}
            <div className="grid grid-cols-[120px_repeat(7,1fr)] gap-4 bg-card/50">
              {serviceBays.map((bay) => (
                <React.Fragment key={bay}>
                  <div className="p-2 text-sm font-medium">{bay}</div>
                  {mobileDays.map((day) => (
                    <div 
                      key={day.toISOString()}
                      className="p-2 border-l min-h-[80px]"
                    >
                      {getWorkOrdersForDay(day).map((order) => (
                        <div 
                          key={order.id}
                          className="text-xs p-1 bg-primary/10 rounded mb-1"
                        >
                          {order.first_name} {order.last_name}
                        </div>
                      ))}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <Dialog open={showMonthPicker} onOpenChange={setShowMonthPicker}>
          <DialogContent>
            <Calendar
              mode="multiple"
              selected={[currentDate]}
              onSelect={(date) => {
                if (date) {
                  // Handle date selection
                  setShowMonthPicker(false)
                }
              }}
              className="rounded-md border"
            />
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-card/50 p-4">
      <div className="grid grid-cols-7 gap-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-sm font-medium text-muted-foreground text-center py-2">
            {day}
          </div>
        ))}
        {days.map((day) => (
          <CalendarDay
            key={day.toISOString()}
            date={day}
            workOrders={getWorkOrdersForDay(day)}
            isCurrentMonth={isSameMonth(day, currentDate)}
            blockedDates={blockedDates}
          />
        ))}
      </div>
    </div>
  )
}
