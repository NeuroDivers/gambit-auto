
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
            const blocked = isDateBlocked(date);

            // Handle work order spans
            if (workOrder) {
              // If it's a blocked date, show the blocked cell
              if (blocked) {
                return (
                  <div 
                    key={date.toISOString()}
                    className={cn(
                      "p-2 relative flex items-center justify-center border-b border-r border-gray-700/50",
                      "bg-red-900/20 cursor-not-allowed"
                    )}
                  />
                );
              }

              // If we're in the middle of a work order span
              if (!isWorkOrderStart(date, workOrder)) {
                return null;
              }

              // If it's the start of a work order
              if (isWorkOrderStart(date, workOrder)) {
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
            }

            // Handle non-work order cells (either blocked or empty)
            return (
              <div 
                key={date.toISOString()}
                className={cn(
                  "p-2 relative flex items-center justify-center border-b border-r border-gray-700/50",
                  blocked ? (
                    "bg-red-900/20 cursor-not-allowed"
                  ) : (
                    "transition-colors hover:bg-gray-700/20 cursor-pointer"
                  ),
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
