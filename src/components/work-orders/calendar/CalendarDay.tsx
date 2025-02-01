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

  const handleDayClick = (e: React.MouseEvent) => {
    // Only open create dialog if clicking directly on the day container
    if (e.currentTarget === e.target || (e.target as HTMLElement).classList.contains('day-container')) {
      setIsCreateDialogOpen(true)
    }
  }

  return (
    <>
      <div 
        className={cn(
          "relative min-h-[120px] p-2 border border-[#e5e7eb]/20 rounded-md cursor-pointer transition-all duration-200 day-container",
          !isCurrentMonth && "opacity-50 bg-background/50",
          "hover:border-dashed hover:border-primary/50"
        )}
        onClick={handleDayClick}
      >
        <div className="font-medium text-sm mb-2 day-container">
          {format(date, 'd')}
        </div>
        <div className="space-y-1">
          {workOrders?.map((workOrder) => (
            <WorkOrderCard
              key={workOrder.id}
              workOrder={workOrder}
              onClick={(e) => {
                e.stopPropagation()
              }}
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