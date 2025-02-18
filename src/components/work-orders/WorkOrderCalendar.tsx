
import { format, startOfMonth } from "date-fns"
import { useState } from "react"
import { CalendarHeader } from "./calendar/CalendarHeader"
import { CalendarGrid } from "./calendar/CalendarGrid"
import { useWorkOrderData } from "./calendar/useWorkOrderData"
import { LoadingScreen } from "../shared/LoadingScreen"
import { CreateWorkOrderDialog } from "./CreateWorkOrderDialog"

interface WorkOrderCalendarProps {
  clientView?: boolean;
}

export function WorkOrderCalendar({ clientView = false }: WorkOrderCalendarProps) {
  const [currentDate, setCurrentDate] = useState(startOfMonth(new Date()))
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const { data: workOrders = [], isLoading } = useWorkOrderData()

  const handlePrevMonth = () => {
    const prevMonth = new Date(currentDate)
    prevMonth.setMonth(prevMonth.getMonth() - 1)
    setCurrentDate(prevMonth)
  }

  const handleNextMonth = () => {
    const nextMonth = new Date(currentDate)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    setCurrentDate(nextMonth)
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="space-y-6">
      {!clientView && (
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">
            Work Orders - {format(currentDate, 'MMMM yyyy')}
          </h1>
          <CreateWorkOrderDialog 
            open={showCreateDialog} 
            onOpenChange={setShowCreateDialog} 
          />
        </div>
      )}
      
      <div className="rounded-lg border bg-card">
        <CalendarHeader 
          currentDate={currentDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />
        <CalendarGrid 
          currentDate={currentDate} 
          workOrders={workOrders}
          onDateChange={!clientView ? (date) => {
            setCurrentDate(date)
            setShowCreateDialog(true)
          } : undefined}
        />
      </div>
    </div>
  )
}
