
import { FC } from "react"
import { WorkOrder } from "../types"
import { WorkOrderCard } from "./WorkOrderCard"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { isToday, format } from "date-fns"

type CalendarDayProps = {
  date: Date
  workOrders: WorkOrder[]
  onWorkOrderClick: (workOrder: WorkOrder) => void
  isCurrentMonth?: boolean
}

export const CalendarDay: FC<CalendarDayProps> = ({
  date,
  workOrders,
  onWorkOrderClick,
  isCurrentMonth = true,
}) => {
  const dayNumber = date.getDate()
  const isCurrentDate = isToday(date)
  const formattedDate = format(date, 'yyyy-MM-dd')
  
  // Get work orders for this day
  const dayWorkOrders = workOrders.filter(workOrder => {
    if (!workOrder.start_time) return false
    const workOrderDate = new Date(workOrder.start_time)
    return workOrderDate.toDateString() === date.toDateString()
  })

  return (
    <div
      className={cn(
        "min-h-[100px] p-2 border border-border/40",
        "transition-colors duration-200",
        isCurrentMonth ? "bg-white" : "bg-gray-50/50",
        isCurrentDate && "bg-primary/5 ring-1 ring-primary/30",
        dayWorkOrders.length > 0 && "bg-secondary/5"
      )}
      data-date={formattedDate}
    >
      <div className="flex justify-between items-start">
        <span
          className={cn(
            "inline-flex h-6 w-6 items-center justify-center rounded-full text-sm",
            isCurrentDate && "bg-primary text-primary-foreground font-medium"
          )}
        >
          {dayNumber}
        </span>
        
        {dayWorkOrders.length > 0 && (
          <Badge variant="outline" className="text-[10px] bg-secondary/10">
            {dayWorkOrders.length}
          </Badge>
        )}
      </div>

      <div className="mt-2 space-y-1">
        {dayWorkOrders.slice(0, 2).map((workOrder) => (
          <WorkOrderCard 
            key={workOrder.id} 
            workOrder={workOrder}
            className="text-xs"
            date={date}
            span={1}
            onClick={() => onWorkOrderClick(workOrder)}
          />
        ))}
        
        {dayWorkOrders.length > 2 && (
          <div className="text-xs text-muted-foreground mt-1 text-center">
            +{dayWorkOrders.length - 2} more
          </div>
        )}
      </div>
    </div>
  )
}
