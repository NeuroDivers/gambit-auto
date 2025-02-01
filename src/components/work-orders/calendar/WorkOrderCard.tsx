import { WorkOrder } from "../types"
import { useState } from "react"
import { WorkOrderDetailsDialog } from "./WorkOrderDetailsDialog"
import { cn } from "@/lib/utils"

type WorkOrderCardProps = {
  workOrder: WorkOrder
  onClick: (e: React.MouseEvent) => void
}

export function WorkOrderCard({ workOrder, onClick }: WorkOrderCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-muted/30 text-muted-foreground/70 hover:bg-muted/40'
      case 'approved':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
      case 'rejected':
        return 'bg-destructive/10 text-destructive hover:bg-destructive/20'
      case 'completed':
        return 'bg-primary/10 text-primary hover:bg-primary/20'
      default:
        return 'bg-primary/10 hover:bg-primary/20'
    }
  }

  return (
    <>
      <div 
        className={cn(
          "relative text-xs p-1 rounded truncate cursor-pointer transition-colors",
          getStatusStyle(workOrder.status)
        )}
        onClick={(e) => {
          e.stopPropagation()
          setIsDetailsOpen(true)
        }}
      >
        <div className="truncate">
          {workOrder.first_name} {workOrder.last_name}
        </div>
        <div className="text-inherit opacity-80 truncate">
          {workOrder.vehicle_make} {workOrder.vehicle_model}
        </div>
      </div>
      <WorkOrderDetailsDialog
        workOrder={workOrder}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </>
  )
}