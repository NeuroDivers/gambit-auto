
import { WorkOrder } from "../types"
import { User2 } from "lucide-react"
import { formatTime } from "../utils/dateUtils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { isToday } from "date-fns"

interface WorkOrderCardProps {
  workOrder: WorkOrder & { isStart?: boolean; isEnd?: boolean; duration?: number; }
  date: Date
  span: number
  onClick: () => void
  className?: string // Added className prop
}

export function WorkOrderCard({ workOrder, date, span, onClick, className }: WorkOrderCardProps) {
  return (
    <div 
      className={cn(
        "p-2 relative flex items-center border-b border-r border-gray-200",
        "hover:brightness-95 transition-all cursor-pointer",
        isToday(date) ? "bg-primary/10" : "bg-white",
        className
      )}
      onClick={onClick}
      style={{
        gridColumn: `span ${span}`
      }}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="bg-primary p-2 rounded-lg border border-white/20 w-full shadow-sm overflow-hidden">
              <div className="text-xs text-primary-foreground font-medium truncate">
                {workOrder.customer_first_name} {workOrder.customer_last_name}
              </div>
              <div className="flex items-center justify-between mt-1">
                <div className="text-xs text-primary-foreground/90 flex items-center gap-1">
                  <User2 className="w-3 h-3" />
                  <span className="whitespace-nowrap">{formatTime(workOrder.start_time)}</span>
                </div>
                <div className="text-xs text-primary-foreground/90 whitespace-nowrap">
                  {formatTime(workOrder.end_time)}
                </div>
              </div>
              <div className="text-[10px] text-primary-foreground/80 truncate mt-1">
                {workOrder.vehicle_year} {workOrder.vehicle_make} {workOrder.vehicle_model}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">{workOrder.customer_first_name} {workOrder.customer_last_name}</p>
              <p className="text-sm text-gray-400">
                {workOrder.vehicle_year} {workOrder.vehicle_make} {workOrder.vehicle_model}
              </p>
              <p className="text-sm text-primary">
                {formatTime(workOrder.start_time)} - {formatTime(workOrder.end_time)}
              </p>
              {workOrder.additional_notes && (
                <div className="mt-1">
                  <span className="text-xs text-gray-400">Notes:</span>
                  <p className="text-xs text-gray-300">{workOrder.additional_notes}</p>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
