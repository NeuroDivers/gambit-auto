import { WorkOrder } from "../types"
import { useState } from "react"
import { WorkOrderDetailsDialog } from "./WorkOrderDetailsDialog"

type WorkOrderCardProps = {
  workOrder: WorkOrder
  onClick: (e: React.MouseEvent) => void
}

export function WorkOrderCard({ workOrder, onClick }: WorkOrderCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  return (
    <>
      <div 
        className="relative text-xs bg-primary/10 p-1 rounded truncate cursor-pointer hover:bg-primary/20 transition-colors"
        onClick={(e) => {
          e.stopPropagation()
          setIsDetailsOpen(true)
        }}
      >
        <div className="truncate">
          {workOrder.first_name} {workOrder.last_name}
        </div>
        <div className="text-muted-foreground truncate">
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