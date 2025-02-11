
import { format, parseISO, isSameDay, differenceInDays } from "date-fns"
import { WorkOrder } from "../../types"
import { WorkOrderCard } from "../WorkOrderCard"

type MobileCalendarRowProps = {
  bayId: string
  bayName: string
  visibleDays: Date[]
  workOrders: WorkOrder[]
  onDateClick: (date: Date) => void
}

export function MobileCalendarRow({ bayId, bayName, visibleDays, workOrders, onDateClick }: MobileCalendarRowProps) {
  const getWorkOrdersForDay = (date: Date) => {
    return workOrders.filter(workOrder => {
      if (!workOrder.start_time || workOrder.assigned_bay_id !== bayId) return false
      
      const startDate = parseISO(workOrder.start_time)
      const endDate = workOrder.end_time ? parseISO(workOrder.end_time) : startDate
      
      const isWithinDuration = (
        isSameDay(date, startDate) || 
        isSameDay(date, endDate) ||
        (date > startDate && date < endDate)
      )
      
      return isWithinDuration
    }).map(order => ({
      ...order,
      isStart: isSameDay(date, parseISO(order.start_time)),
      isEnd: order.end_time ? isSameDay(date, parseISO(order.end_time)) : true,
      duration: order.end_time ? 
        differenceInDays(parseISO(order.end_time), parseISO(order.start_time)) + 1 : 
        1
    }))
  }

  return (
    <>
      <div className="w-[86px] p-2 text-sm font-medium truncate">{bayName}</div>
      {visibleDays.slice(0, 7).map((day) => {
        const workOrdersForDay = getWorkOrdersForDay(day)
        return (
          <div 
            key={day.toISOString()}
            className="relative p-2 border-l h-[80px] min-h-[80px] group hover:bg-muted/50 cursor-pointer"
            onClick={() => onDateClick(day)}
          >
            {workOrdersForDay.map((order) => (
              <WorkOrderCard 
                key={order.id}
                workOrder={order}
                className="mb-1"
              />
            ))}
          </div>
        )
      })}
    </>
  )
}
