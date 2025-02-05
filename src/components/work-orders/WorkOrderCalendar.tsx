import { useState } from "react"
import { addMonths, subMonths, startOfDay, endOfDay } from "date-fns"
import { CalendarDay } from "./calendar/CalendarDay"
import { CalendarGrid } from "./calendar/CalendarGrid"
import { CalendarHeader } from "./calendar/CalendarHeader"
import { useWorkOrderData } from "./calendar/useWorkOrderData"
import { StatusLegend } from "./StatusLegend"
import { CalendarDayView } from "./calendar/CalendarDayView"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Calendar as CalendarIcon, Clock } from "lucide-react"

export function WorkOrderCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'day'>('month')
  const { data: workOrders = [], isLoading } = useWorkOrderData()

  const statusCounts = {
    pending: workOrders.filter(wo => wo.status === 'pending').length,
    approved: workOrders.filter(wo => wo.status === 'approved').length,
    rejected: workOrders.filter(wo => wo.status === 'rejected').length,
    completed: workOrders.filter(wo => wo.status === 'completed').length
  }

  const handlePrevMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1))
  }

  const getWorkOrdersForDay = () => {
    const dayStart = startOfDay(currentDate)
    const dayEnd = endOfDay(currentDate)
    
    return workOrders.filter(workOrder => {
      if (!workOrder.start_time) return false
      const orderDate = new Date(workOrder.start_time)
      return orderDate >= dayStart && orderDate <= dayEnd
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-primary/60">Loading calendar...</div>
      </div>
    )
  }

  return (
    <section className="space-y-6 bg-gradient-to-b from-card/80 to-card rounded-xl shadow-lg border border-border/50 p-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-foreground">Work Order Calendar</h3>
          <ToggleGroup type="single" value={view} onValueChange={(value) => value && setView(value as 'month' | 'day')}>
            <ToggleGroupItem value="month" aria-label="Month view">
              <CalendarIcon className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="day" aria-label="Day view">
              <Clock className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <StatusLegend statusCounts={statusCounts} />
        <div className="space-y-4">
          <CalendarHeader
            currentDate={currentDate}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />
          {view === 'month' ? (
            <CalendarGrid
              currentDate={currentDate}
              workOrders={workOrders}
            />
          ) : (
            <CalendarDayView
              currentDate={currentDate}
              workOrders={getWorkOrdersForDay()}
            />
          )}
        </div>
      </div>
    </section>
  )
}