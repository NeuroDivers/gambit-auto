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
    e.stopPropagation()
    setIsDetailsOpen(true)
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-muted/40 text-muted-foreground hover:bg-muted/50'
      case 'approved':
        return 'bg-[rgb(59,130,246,0.2)] text-blue-400 hover:bg-[rgb(59,130,246,0.3)]'
      case 'rejected':
        return 'bg-[rgb(234,56,76,0.2)] text-[#ea384c] hover:bg-[rgb(234,56,76,0.3)]'
      case 'completed':
        return 'bg-[rgb(34,197,94,0.2)] text-green-400 hover:bg-[rgb(34,197,94,0.3)]'
      default:
        return 'bg-muted/40 text-muted-foreground hover:bg-muted/50'
    }
  }

  return (
    <>
      <div 
        className={cn(
          "relative text-xs p-1.5 rounded-md truncate cursor-pointer transition-colors",
          "hover:shadow-md",
          getStatusStyle(workOrder.status),
          className
        )}
        onClick={handleClick}
      >
        <div className="truncate font-medium">
          {workOrder.first_name} {workOrder.last_name}
        </div>
        <div className="text-[10px] opacity-80 truncate">
          {workOrder.vehicle_make} {workOrder.vehicle_model}
        </div>
        {workOrder.start_time && (
          <div className="text-[10px] opacity-70">
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