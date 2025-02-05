import { WorkOrder } from "../types"
import { useState } from "react"
import { WorkOrderDetailsDialog } from "./WorkOrderDetailsDialog"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

type WorkOrderCardProps = {
  workOrder: WorkOrder
  className?: string
}

export function WorkOrderCard({ workOrder, className }: WorkOrderCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent the click from reaching the calendar day
    setIsDetailsOpen(true)
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-muted/40 text-muted-foreground hover:bg-muted/50'
      case 'approved':
        return 'bg-[rgb(59,130,246,0.2)] text-blue-400 hover:bg-[rgb(59,130,246,0.3)] font-semibold'
      case 'rejected':
        return 'bg-[#ea384c]/30 text-[#ea384c] hover:bg-[#ea384c]/40 font-semibold'
      case 'completed':
        return 'bg-[rgb(34,197,94,0.2)] text-green-400 hover:bg-[rgb(34,197,94,0.3)] font-semibold'
      default:
        return 'bg-muted/40 text-muted-foreground hover:bg-muted/50'
    }
  }

  return (
    <>
      <div 
        className={cn(
          "relative text-sm p-2 rounded truncate cursor-pointer transition-colors shadow-sm",
          getStatusStyle(workOrder.status),
          className
        )}
        onClick={handleClick}
      >
        <div className="truncate font-semibold">
          {workOrder.first_name} {workOrder.last_name}
        </div>
        <div className="text-inherit opacity-100 truncate">
          {workOrder.vehicle_make} {workOrder.vehicle_model}
        </div>
        {workOrder.start_time && (
          <div className="text-xs opacity-70">
            {format(new Date(workOrder.start_time), 'h:mm a')}
          </div>
        )}
      </div>
      <WorkOrderDetailsDialog
        workOrder={workOrder}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </>
  )
}