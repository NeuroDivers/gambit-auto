
import { WorkOrder } from "@/components/work-orders/types"
import { User2 } from "lucide-react"
import { formatTime } from "../utils/dateUtils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { isToday } from "date-fns"

interface WorkOrderCardProps {
  workOrder: WorkOrder
  date: Date
  onClick: () => void
}

export function WorkOrderCard({ workOrder, date, onClick }: WorkOrderCardProps) {
  return (
    <div 
      className={cn(
        "p-2 relative flex items-center border-b border-gray-700/50",
        "hover:bg-gray-700/20 transition-colors cursor-pointer",
        isToday(date) && "bg-gray-700/20"
      )}
      onClick={onClick}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="bg-[#1F2937] p-2 rounded-lg border border-[#50D091]/20 w-full">
              <div className="text-xs text-white truncate">
                {workOrder.first_name} {workOrder.last_name}
              </div>
              <div className="text-xs text-[#50D091] mt-1 flex items-center gap-1">
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
              <p className="text-sm text-[#50D091]">
                {formatTime(workOrder.start_time)} ({workOrder.estimated_duration} day{parseInt(workOrder.estimated_duration || '1') !== 1 ? 's' : ''})
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
