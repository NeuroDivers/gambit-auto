import { format } from "date-fns"
import { WorkOrder } from "../types"
import { cn } from "@/lib/utils"
import { CreateWorkOrderDialog } from "../CreateWorkOrderDialog"
import { useState } from "react"
import { WorkOrderCard } from "./WorkOrderCard"

type CalendarDayProps = {
  date: Date
  workOrders: WorkOrder[]
  isCurrentMonth: boolean
}

export function CalendarDay({ date, workOrders, isCurrentMonth }: CalendarDayProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  return (
    <>
      <div 
        className={cn(
          "relative min-h-[120px] p-2 border border-border/20 rounded-md cursor-pointer transition-all duration-200",
          !isCurrentMonth && "opacity-50 bg-background/50",
          "hover:border-dashed hover:border-primary/50"
        )}
        style={{ isolation: 'isolate' }}
        onClick={() => setIsCreateDialogOpen(true)}
      >
        <div className="font-medium text-sm mb-2 relative z-[1]">
          {format(date, 'd')}
        </div>
        <div className="space-y-1 relative z-[2]" style={{ isolation: 'isolate' }}>
          {workOrders?.map((workOrder) => (
            <WorkOrderCard
              key={workOrder.id}
              workOrder={workOrder}
              onClick={(e) => e.stopPropagation()}
            />
          ))}
        </div>
      </div>
      <CreateWorkOrderDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
      />
    </>
  )
}