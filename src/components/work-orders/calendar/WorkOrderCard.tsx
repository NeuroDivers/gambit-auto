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
        return 'bg-[#0EA5E9]/20 text-[#0EA5E9] hover:bg-[#0EA5E9]/30 font-medium'
      case 'rejected':
        return 'bg-[#ea384c]/20 text-[#ea384c] hover:bg-[#ea384c]/30 font-medium'
      case 'completed':
        return 'bg-[#9b87f5]/20 text-[#9b87f5] hover:bg-[#9b87f5]/30 font-medium'
      default:
        return 'bg-muted/30 text-muted-foreground/70 hover:bg-muted/40'
    }
  }

  return (
    <>
      <div 
        className={cn(
          "relative text-xs p-1.5 rounded truncate cursor-pointer transition-colors",
          getStatusStyle(workOrder.status)
        )}
        onClick={(e) => {
          e.stopPropagation()
          setIsDetailsOpen(true)
        }}
      >
        <div className="truncate font-medium">
          {workOrder.first_name} {workOrder.last_name}
        </div>
        <div className="text-inherit opacity-90 truncate">
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