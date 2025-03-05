
import { WorkOrder } from "@/components/work-orders/types"
import { User2 } from "lucide-react"
import { formatTime } from "../utils/dateUtils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { isToday } from "date-fns"

interface WorkOrderCardProps {
  workOrder: WorkOrder
  date: Date
  span: number
  onClick: () => void
}

export function WorkOrderCard({ workOrder, date, span, onClick }: WorkOrderCardProps) {
  return (
    <div 
      className={cn(
        "p-2 relative flex items-center border-b border-r border-gray-200",
        "hover:brightness-95 transition-all cursor-pointer",
        isToday(date) ? "bg-primary/10" : "bg-white"
      )}
      onClick={onClick}
      style={{
        gridColumn: `span ${span}`
      }}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="bg-primary p-2 rounded-lg border border-white/20 w-full shadow-sm">
              <div className="text-xs text-primary-foreground font-medium truncate">
                {workOrder.first_name} {workOrder.last_name}
              </div>
              <div className="text-xs text-primary-foreground/90 mt-1 flex items-center gap-1">
                <User2 className="w-3 h-3" />
                <span>{formatTime(workOrder.start_time)}</span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">{workOrder.first_name} {workOrder.last_name}</p>
              <p className="text-sm text-gray-400">
                {workOrder.vehicle_year} {workOrder.vehicle_make} {workOrder.vehicle_model}
              </p>
              <p className="text-sm text-primary">
                {formatTime(workOrder.start_time)} - {formatTime(workOrder.end_time)}
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
