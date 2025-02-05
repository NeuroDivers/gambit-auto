import { format, isToday, setHours } from "date-fns"
import { WorkOrder } from "../types"
import { cn } from "@/lib/utils"
import { WorkOrderCard } from "./WorkOrderCard"
import { useState } from "react"
import { CreateWorkOrderDialog } from "../CreateWorkOrderDialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar } from "lucide-react"

type CalendarDayProps = {
  date: Date
  workOrders: WorkOrder[]
  isCurrentMonth: boolean
}

export function CalendarDay({ date, workOrders, isCurrentMonth }: CalendarDayProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const defaultStartTime = setHours(date, 8)

  const handleDayClick = (e: React.MouseEvent) => {
    // Only open create dialog if clicking directly on the day cell
    if (e.target === e.currentTarget) {
      setShowCreateDialog(true)
    }
  }

  const unscheduledWorkOrders = workOrders.filter(wo => !wo.start_time)
  const scheduledWorkOrders = workOrders.filter(wo => wo.start_time)

  return (
    <>
      <div 
        className={cn(
          "relative min-h-[120px] p-2 bg-background/50 border border-border/50 rounded-lg transition-all duration-200",
          "hover:bg-primary/5 cursor-pointer group",
          !isCurrentMonth && "opacity-50 bg-muted/20",
          isToday(date) && "ring-2 ring-primary bg-primary/5",
        )}
        onClick={handleDayClick}
      >
        <div className={cn(
          "font-medium text-sm mb-2 flex items-center justify-between",
          isToday(date) && "text-primary"
        )}>
          <span className={cn(
            "h-6 w-6 flex items-center justify-center rounded-full",
            isToday(date) && "bg-primary text-primary-foreground"
          )}>
            {format(date, 'd')}
          </span>
          {isCurrentMonth && (
            <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              Click to add
            </span>
          )}
        </div>
        
        <div className="space-y-1">
          {scheduledWorkOrders.map((workOrder) => (
            <WorkOrderCard
              key={workOrder.id}
              workOrder={workOrder}
              className="work-order-card"
            />
          ))}
          
          {unscheduledWorkOrders.length > 0 && (
            <Alert variant="default" className="mt-2 py-1 px-2 bg-yellow-500/10 border-yellow-500/20">
              <Calendar className="h-3 w-3 text-yellow-500" />
              <AlertDescription className="text-xs text-yellow-500">
                {unscheduledWorkOrders.length} unscheduled
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
      <CreateWorkOrderDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
        defaultStartTime={defaultStartTime}
      />
    </>
  )
}