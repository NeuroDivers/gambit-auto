import { format, isToday, setHours } from "date-fns"
import { WorkOrder } from "../types"
import { cn } from "@/lib/utils"
import { WorkOrderCard } from "./WorkOrderCard"
import { useState } from "react"
import { CreateWorkOrderDialog } from "../CreateWorkOrderDialog"

type CalendarDayProps = {
  date: Date
  workOrders: WorkOrder[]
  isCurrentMonth: boolean
}

export function CalendarDay({ date, workOrders, isCurrentMonth }: CalendarDayProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const defaultStartTime = setHours(date, 8) // Set default time to 8 AM

  return (
    <>
      <div 
        className={cn(
          "relative min-h-[120px] p-2 border border-[#e5e7eb]/20 rounded-md transition-all duration-200 day-container hover:bg-primary/5 cursor-pointer",
          !isCurrentMonth && "opacity-50 bg-background/50",
          isToday(date) && "ring-2 ring-primary/30 bg-primary/5",
        )}
        onClick={() => setShowCreateDialog(true)}
      >
        <div className={cn(
          "font-medium text-sm mb-2 day-container",
          isToday(date) && "text-primary font-semibold text-base"
        )}>
          {format(date, 'd')}
        </div>
        <div className="space-y-1">
          {workOrders?.map((workOrder) => (
            <WorkOrderCard
              key={workOrder.id}
              workOrder={workOrder}
            />
          ))}
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