import { useState } from "react"
import { addMonths, subMonths } from "date-fns"
import { CreateWorkOrderDialog } from "./CreateWorkOrderDialog"
import { CalendarDay } from "./calendar/CalendarDay"
import { CalendarGrid } from "./calendar/CalendarGrid"
import { CalendarHeader } from "./calendar/CalendarHeader"
import { useWorkOrderData } from "./calendar/useWorkOrderData"
import { ServiceLegend } from "./calendar/ServiceLegend"

export function WorkOrderCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const { data: workOrders = [], isLoading } = useWorkOrderData()

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
    <section className="bg-card/50 backdrop-blur-sm rounded-xl shadow-lg border border-white/5 p-8 relative" style={{ isolation: 'isolate' }}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Work Order Calendar</h3>
          <CreateWorkOrderDialog />
        </div>
        <ServiceLegend />
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