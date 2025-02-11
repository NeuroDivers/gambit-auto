
import React from "react"
import { format, parseISO, isSameDay, differenceInDays, isWithinInterval } from "date-fns"
import { WorkOrder } from "../../types"
import { WorkOrderCard } from "../WorkOrderCard"
import { BlockedDate } from "../types"

type MobileCalendarRowProps = {
  bayId: string
  bayName: string
  visibleDays: Date[]
  workOrders: WorkOrder[]
  onDateClick: (date: Date, e?: React.MouseEvent) => void
  blockedDates?: BlockedDate[]
}

export function MobileCalendarRow({ 
  bayId, 
  bayName, 
  visibleDays, 
  workOrders, 
  onDateClick,
  blockedDates = []
}: MobileCalendarRowProps) {
  const getWorkOrdersForDay = (date: Date) => {
    return workOrders.filter(workOrder => {
      if (!workOrder.start_time || workOrder.assigned_bay_id !== bayId) return false
      
      const startDate = parseISO(workOrder.start_time)
      const endDate = workOrder.end_time ? parseISO(workOrder.end_time) : startDate
      
      return (
        isSameDay(date, startDate) || 
        isSameDay(date, endDate) ||
        (date > startDate && date < endDate)
      )
    }).map(order => ({
      ...order,
      isStart: isSameDay(date, parseISO(order.start_time)),
      isEnd: order.end_time ? isSameDay(date, parseISO(order.end_time)) : true,
      duration: order.end_time ? 
        differenceInDays(parseISO(order.end_time), parseISO(order.start_time)) + 1 : 
        1
    }))
  }

  const isDateBlocked = (date: Date) => {
    return blockedDates.some(blockedDate => {
      if (!blockedDate.start_date || !blockedDate.end_date) return false;
      const start = parseISO(blockedDate.start_date)
      const end = parseISO(blockedDate.end_date)
      return isWithinInterval(date, { start, end })
    })
  }

  return (
    <>
      <div className="sticky left-0 z-20 w-[86px] bg-muted/50 p-2 text-sm font-medium truncate border-r shadow-sm">
        {bayName}
      </div>
      {visibleDays.map((day) => {
        const workOrdersForDay = getWorkOrdersForDay(day)
        const blocked = isDateBlocked(day)
        return (
          <div 
            key={format(day, 'yyyy-MM-dd')}
            className={`relative p-2 border-l h-[80px] min-h-[80px] group hover:bg-muted/50 cursor-pointer ${
              blocked ? 'bg-destructive/10' : ''
            }`}
            onClick={(e) => onDateClick(day, e)}
          >
            {workOrdersForDay.map((order) => (
              <WorkOrderCard 
                key={order.id}
                workOrder={order}
                className="work-order-card mb-1"
              />
            ))}
          </div>
        )
      })}
    </>
  )
}
