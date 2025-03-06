
import { WorkOrder } from "@/components/work-orders/types"
import { WorkOrderCard } from "../../calendar/components/WorkOrderCard"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export interface CalendarDayProps {
  date: Date
  workOrders: WorkOrder[]
  isCurrentMonth: boolean
}

export function CalendarDay({ date, workOrders, isCurrentMonth }: CalendarDayProps) {
  // Sort work orders by start_time
  const sortedWorkOrders = [...workOrders].sort((a, b) => {
    return new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  })

  return (
    <div className={cn(
      "min-h-[120px] border-l border-b border-gray-200",
      !isCurrentMonth && "bg-gray-50/80"
    )}>
      <header className="p-2 border-b border-gray-200 bg-white">
        <p className={cn(
          "text-sm font-medium",
          !isCurrentMonth && "text-gray-400"
        )}>
          {format(date, "d")}
        </p>
      </header>
      <div className="space-y-1 p-1">
        {sortedWorkOrders.map(workOrder => (
          <WorkOrderCard
            key={workOrder.id}
            workOrder={workOrder}
            date={date}
            span={1}
            onClick={() => {}}
            className="border-none shadow-sm my-1"
          />
        ))}
      </div>
    </div>
  )
}
