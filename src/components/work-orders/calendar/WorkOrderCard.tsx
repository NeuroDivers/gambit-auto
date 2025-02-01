import { WorkOrder } from "../types"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { WorkOrderPreview } from "./WorkOrderPreview"

type WorkOrderCardProps = {
  workOrder: WorkOrder
  onClick: (e: React.MouseEvent) => void
}

export function WorkOrderCard({ workOrder, onClick }: WorkOrderCardProps) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div 
          className="text-xs bg-primary/10 p-1 rounded truncate cursor-pointer"
          onClick={onClick}
        >
          <div className="truncate">
            {workOrder.first_name} {workOrder.last_name}
          </div>
          <div className="text-muted-foreground truncate">
            {workOrder.vehicle_make} {workOrder.vehicle_model}
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-4">
        <WorkOrderPreview workOrder={workOrder} />
      </HoverCardContent>
    </HoverCard>
  )
}