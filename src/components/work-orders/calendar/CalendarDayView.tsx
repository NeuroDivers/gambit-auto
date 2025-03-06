
import { format } from "date-fns"
import { WorkOrder } from "../types"
import { WorkOrderCard } from "../../calendar/components/WorkOrderCard"

interface CalendarDayViewProps {
  selectedDate: Date
  workOrders: WorkOrder[]
}

export function CalendarDayView({ selectedDate, workOrders }: CalendarDayViewProps) {
  // Filter work orders for the selected date and sort by start time
  const filteredWorkOrders = workOrders
    .filter(workOrder => {
      const workOrderDate = new Date(workOrder.start_time)
      return (
        workOrderDate.getDate() === selectedDate.getDate() &&
        workOrderDate.getMonth() === selectedDate.getMonth() &&
        workOrderDate.getFullYear() === selectedDate.getFullYear()
      )
    })
    .sort((a, b) => {
      return new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    })

  return (
    <div className="h-full flex flex-col bg-card">
      <header className="px-4 py-3 border-b">
        <h2 className="text-lg font-semibold">{format(selectedDate, "EEEE, MMMM d, yyyy")}</h2>
      </header>
      <div className="p-4 space-y-3 flex-1 overflow-y-auto">
        {filteredWorkOrders.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No work orders for this day</p>
          </div>
        ) : (
          filteredWorkOrders.map(workOrder => (
            <WorkOrderCard
              key={workOrder.id}
              workOrder={workOrder}
              date={selectedDate}
              span={1}
              onClick={() => {}}
              className="shadow-md border rounded-md"
            />
          ))
        )}
      </div>
    </div>
  )
}
