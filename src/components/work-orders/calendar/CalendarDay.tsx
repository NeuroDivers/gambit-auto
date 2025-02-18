
import { format, isToday, setHours, isWithinInterval, isPast, startOfDay } from "date-fns"
import { WorkOrder } from "../types"
import { cn } from "@/lib/utils"
import { WorkOrderCard } from "./WorkOrderCard"
import { useState } from "react"
import { CreateWorkOrderDialog } from "../CreateWorkOrderDialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Lock } from "lucide-react"
import { BlockedDate } from "./types"
import { toast } from "sonner"

type CalendarDayProps = {
  date: Date
  workOrders: WorkOrder[]
  isCurrentMonth: boolean
  blockedDates?: BlockedDate[]
}

export function CalendarDay({ date, workOrders, isCurrentMonth, blockedDates = [] }: CalendarDayProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const defaultStartTime = setHours(date, 8)
  const isPastDate = isPast(startOfDay(date)) && !isToday(date)

  const isDateBlocked = blockedDates.some(block => {
    const startDate = new Date(block.start_date)
    const endDate = new Date(block.end_date)
    return isWithinInterval(date, { start: startDate, end: endDate })
  })

  const handleDayClick = (e: React.MouseEvent) => {
    // Only open create dialog if clicking directly on the day cell
    if (e.target === e.currentTarget) {
      if (isPastDate) {
        toast.error("Cannot create work orders for past dates")
        return
      }
      if (isDateBlocked) {
        toast.error("This date is blocked for bookings")
        return
      }
      setShowCreateDialog(true)
    }
  }

  const unscheduledWorkOrders = workOrders.filter(wo => !wo.start_time)
  const scheduledWorkOrders = workOrders.filter(wo => wo.start_time)

  const blockedDateInfo = blockedDates.find(block => {
    const startDate = new Date(block.start_date)
    const endDate = new Date(block.end_date)
    return isWithinInterval(date, { start: startDate, end: endDate })
  })

  return (
    <>
      <div 
        className={cn(
          "relative min-h-[120px] p-2 bg-background/50 border border-border/50 rounded-lg transition-all duration-200",
          "hover:bg-primary/5 cursor-pointer group",
          !isCurrentMonth && "opacity-50 bg-muted/20",
          isToday(date) && "ring-2 ring-primary bg-primary/5",
          isDateBlocked && "bg-destructive/5 hover:bg-destructive/10",
          isPastDate && "cursor-not-allowed hover:bg-background/50"
        )}
        onClick={handleDayClick}
      >
        <div className={cn(
          "font-medium text-sm mb-2 flex items-center justify-between text-foreground",
          isToday(date) && "text-primary"
        )}>
          <span className={cn(
            "h-6 w-6 flex items-center justify-center rounded-full",
            isToday(date) && "bg-primary text-primary-foreground"
          )}>
            {format(date, 'd')}
          </span>
          {isCurrentMonth && !isDateBlocked && !isPastDate && (
            <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              Click to add
            </span>
          )}
          {isDateBlocked && (
            <Lock className="h-4 w-4 text-destructive" />
          )}
        </div>
        
        {isDateBlocked && blockedDateInfo?.reason && (
          <Alert variant="destructive" className="mt-2 py-1 px-2">
            <AlertDescription className="text-xs">
              {blockedDateInfo.reason}
            </AlertDescription>
          </Alert>
        )}

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
