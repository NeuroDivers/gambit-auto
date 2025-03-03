
import { format, isValid } from "date-fns"
import { WorkOrder } from "../types"
import { WorkOrderCard } from "./WorkOrderCard"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar } from "lucide-react"

type CalendarDayViewProps = {
  currentDate: Date | undefined
  workOrders: WorkOrder[]
}

export function CalendarDayView({ currentDate, workOrders }: CalendarDayViewProps) {
  // Return early if no valid date is provided
  if (!currentDate || !isValid(currentDate)) {
    return (
      <div className="space-y-4 bg-card/50 p-6 rounded-lg">
        <div className="text-muted-foreground text-sm py-4 text-center">
          Please select a valid date
        </div>
      </div>
    )
  }

  const scheduledWorkOrders = workOrders.filter(wo => wo.start_time)
  const unscheduledWorkOrders = workOrders.filter(wo => !wo.start_time)

  // Sort work orders by start time
  const sortedWorkOrders = [...scheduledWorkOrders].sort((a, b) => {
    if (!a.start_time || !b.start_time) return 0
    const dateA = new Date(a.start_time)
    const dateB = new Date(b.start_time)
    return isValid(dateA) && isValid(dateB) ? dateA.getTime() - dateB.getTime() : 0
  })

  return (
    <div className="space-y-4 bg-card/50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold">
        {format(currentDate, 'EEEE, MMMM d, yyyy')}
      </h3>
      
      <div className="space-y-2">
        {sortedWorkOrders.map((workOrder) => (
          <WorkOrderCard
            key={workOrder.id}
            workOrder={workOrder}
            className="work-order-card"
          />
        ))}
        
        {sortedWorkOrders.length === 0 && (
          <div className="text-muted-foreground text-sm py-4 text-center">
            No scheduled work orders for this day
          </div>
        )}

        {unscheduledWorkOrders.length > 0 && (
          <Alert variant="default" className="mt-4 bg-yellow-500/10 border-yellow-500/20">
            <Calendar className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-sm text-yellow-500">
              {unscheduledWorkOrders.length} unscheduled work order{unscheduledWorkOrders.length !== 1 ? 's' : ''}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
