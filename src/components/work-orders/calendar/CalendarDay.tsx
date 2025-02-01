import { format } from "date-fns"
import { WorkOrder } from "../types"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type CalendarDayProps = {
  date: Date
  workOrders: WorkOrder[]
  isCurrentMonth: boolean
}

export function CalendarDay({ date, workOrders, isCurrentMonth }: CalendarDayProps) {
  return (
    <div className={cn(
      "min-h-[120px] p-2 border border-border/20 rounded-md",
      !isCurrentMonth && "opacity-50 bg-background/50"
    )}>
      <div className="font-medium text-sm mb-2">
        {format(date, 'd')}
      </div>
      <div className="space-y-1">
        {workOrders.map((workOrder) => (
          <div 
            key={workOrder.id}
            className="text-xs bg-primary/10 p-1 rounded truncate"
          >
            <Badge variant="outline" className="text-[10px] mb-1">
              {workOrder.status}
            </Badge>
            <div className="truncate">
              {workOrder.first_name} {workOrder.last_name}
            </div>
            <div className="text-muted-foreground truncate">
              {workOrder.vehicle_make} {workOrder.vehicle_model}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}