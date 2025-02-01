import { WorkOrder } from "../types"

type WorkOrderCardProps = {
  workOrder: WorkOrder
  onClick: (e: React.MouseEvent) => void
}

export function WorkOrderCard({ workOrder, onClick }: WorkOrderCardProps) {
  return (
    <div 
      className="relative text-xs bg-primary/10 p-1 rounded truncate cursor-pointer"
      onClick={onClick}
    >
      <div className="truncate">
        {workOrder.first_name} {workOrder.last_name}
      </div>
      <div className="text-muted-foreground truncate">
        {workOrder.vehicle_make} {workOrder.vehicle_model}
      </div>
    </div>
  )
}