import { useState } from "react"
import { addMonths, subMonths } from "date-fns"
import { CalendarDay } from "./calendar/CalendarDay"
import { CalendarGrid } from "./calendar/CalendarGrid"
import { CalendarHeader } from "./calendar/CalendarHeader"
import { useWorkOrderData } from "./calendar/useWorkOrderData"
import { StatusLegend } from "./StatusLegend"

export function WorkOrderCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
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
        </div>
        <StatusLegend statusCounts={statusCounts} />
        <div className="space-y-4">
          <CalendarHeader
            currentDate={currentDate}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />
          <CalendarGrid
            currentDate={currentDate}
            workOrders={workOrders}
          />
        </div>
      </div>
    </section>
  )
}