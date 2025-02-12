
import { isToday } from "date-fns"
import { cn } from "@/lib/utils"
import { WorkOrder } from "@/components/work-orders/types"
import { ServiceBay } from "@/components/service-bays/hooks/useServiceBays"
import { WorkOrderCard } from "./WorkOrderCard"
import { findWorkOrderForDate, isWorkOrderStart, getWorkOrderSpan } from "../utils/dateUtils"

type CalendarContentProps = {
  days: Date[]
  serviceBays?: ServiceBay[]
  workOrders: WorkOrder[]
  isDateBlocked: (date: Date) => boolean
  onDateSelect?: (date: Date) => void
  onWorkOrderSelect: (workOrder: WorkOrder) => void
}

export function CalendarContent({ 
  days, 
  serviceBays, 
  workOrders, 
  isDateBlocked,
  onDateSelect,
  onWorkOrderSelect
}: CalendarContentProps) {
  return (
    <>
      {serviceBays?.map((bay) => (
        <div 
          key={bay.id}
          className="grid"
          style={{ gridTemplateColumns: `100px repeat(${days.length}, 80px)` }}
        >
          <div className="p-4 text-gray-300 sticky left-0 bg-[#222226] z-10 border-b border-r border-gray-700/50">
            {bay.name}
          </div>
          {days.map((date, index) => {
            const workOrder = findWorkOrderForDate(date, bay.id, workOrders);
            const blocked = isDateBlocked(date)
            
            // Skip rendering empty cells if we're in the middle of a work order span
            if (workOrder && !isWorkOrderStart(date, workOrder)) {
              return null;
            }
            
            // If it's the start of a work order, render the work order card
            if (workOrder && isWorkOrderStart(date, workOrder)) {
              const span = getWorkOrderSpan(workOrder, index, days.length);
              
              return (
                <WorkOrderCard
                  key={date.toISOString()}
                  workOrder={workOrder}
                  date={date}
                  span={span}
                  onClick={() => onWorkOrderSelect(workOrder)}
                />
              );
            }
            
            // Render blocked or empty cell
            return (
              <div 
                key={date.toISOString()}
                className={cn(
                  "p-2 relative flex items-center justify-center border-b border-r border-gray-700/50",
                  "transition-colors",
                  !blocked && "hover:bg-gray-700/20 cursor-pointer",
                  blocked && "bg-red-900/20 cursor-not-allowed",
                  isToday(date) && "bg-gray-700/20"
                )}
                onClick={() => !blocked && onDateSelect?.(date)}
              />
            );
          })}
        </div>
      ))}
    </>
  )
}
