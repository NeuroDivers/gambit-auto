
import { FC } from "react"
import { WorkOrder } from "../types"
import { WorkOrderCard } from "./WorkOrderCard"
import { format } from "date-fns"

type CalendarDayViewProps = {
  date: Date
  workOrders: WorkOrder[]
  onWorkOrderClick: (workOrder: WorkOrder) => void
}

export const CalendarDayView: FC<CalendarDayViewProps> = ({
  date,
  workOrders,
  onWorkOrderClick,
}) => {
  const formattedDate = format(date, 'EEEE, MMMM d')
  
  // Get work orders for this day
  const dayWorkOrders = workOrders.filter(workOrder => {
    if (!workOrder.start_time) return false
    const workOrderDate = new Date(workOrder.start_time)
    return workOrderDate.toDateString() === date.toDateString()
  })

  return (
    <div className="bg-white rounded-lg border border-border/40 p-4">
      <h3 className="text-lg font-medium mb-4">{formattedDate}</h3>
      
      {dayWorkOrders.length === 0 ? (
        <div className="text-muted-foreground text-center py-8">
          No work orders scheduled for this day
        </div>
      ) : (
        <div className="space-y-3">
          {dayWorkOrders.map((workOrder) => (
            <WorkOrderCard 
              key={workOrder.id} 
              workOrder={workOrder}
              className="text-sm"
              date={date}
              span={1}
              onClick={() => onWorkOrderClick(workOrder)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
