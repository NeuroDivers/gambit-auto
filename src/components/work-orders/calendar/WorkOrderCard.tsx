
import { WorkOrder } from "../types"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { WorkOrderDetailsDialog } from "./WorkOrderDetailsDialog"
import { format } from "date-fns"

type WorkOrderCardProps = {
  workOrder: WorkOrder & {
    isStart?: boolean
    isEnd?: boolean
    duration?: number
  }
  className?: string
}

export function WorkOrderCard({ workOrder, className }: WorkOrderCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Stop event from bubbling up to calendar day
    setShowDetails(true)
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

  const isMultiDay = workOrder.duration && workOrder.duration > 1

  return (
    <>
      {(workOrder.isStart || !isMultiDay) && (
        <div 
          className={cn(
            "relative text-xs p-1.5 truncate cursor-pointer transition-colors",
            "hover:shadow-md",
            getStatusStyle(workOrder.status),
            {
              'rounded-r-none border-r-0': workOrder.isStart && isMultiDay,
              'rounded-l-none border-l-0': workOrder.isEnd && !workOrder.isStart,
              'rounded-none border-l-0 border-r-0': !workOrder.isStart && !workOrder.isEnd,
            },
            className
          )}
          onClick={handleClick}
          style={{
            marginLeft: workOrder.isStart ? '0' : '-2px',
            marginRight: workOrder.isEnd ? '0' : '-2px',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'rgba(var(--primary), 0.2)',
            width: isMultiDay && workOrder.duration ? `calc(${workOrder.duration * 100}% + ${(workOrder.duration - 1) * 16}px)` : undefined
          }}
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
      )}
      <WorkOrderDetailsDialog
        workOrder={workOrder}
        open={showDetails}
        onOpenChange={setShowDetails}
      />
    </>
  )
}
