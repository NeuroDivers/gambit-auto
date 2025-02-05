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
  const defaultStartTime = setHours(date, 8) // Set default time to 8 AM

  const handleDayClick = (e: React.MouseEvent) => {
    // Only open create dialog if clicking directly on the day container
    if (e.currentTarget === e.target || e.target instanceof Element && e.currentTarget.contains(e.target) && !e.target.closest('.work-order-card')) {
      setShowCreateDialog(true)
    }
  }

  const unscheduledWorkOrders = workOrders.filter(wo => !wo.start_time)
  const scheduledWorkOrders = workOrders.filter(wo => wo.start_time)

  return (
    <>
      <div 
        className={cn(
          "relative min-h-[120px] p-2 border border-[#e5e7eb]/20 rounded-md transition-all duration-200 hover:bg-primary/5 cursor-pointer",
          !isCurrentMonth && "opacity-50 bg-background/50",
          isToday(date) && "ring-2 ring-primary/30 bg-primary/5",
        )}
        onClick={handleDayClick}
      >
        <div className={cn(
          "font-medium text-sm mb-2",
          isToday(date) && "text-primary font-semibold text-base"
        )}>
          {format(date, 'd')}
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
            <Alert variant="warning" className="mt-2 py-1 px-2">
              <Calendar className="h-3 w-3" />
              <AlertDescription className="text-xs">
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