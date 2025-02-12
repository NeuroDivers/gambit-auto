
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
          style={{ gridTemplateColumns: `80px repeat(${days.length}, 60px)` }}
        >
          <div className="p-2 text-gray-300 sticky left-0 bg-[#222226] z-10 border-b border-r border-gray-700/50 text-sm">
            {bay.name}
          </div>
          {days.map((date, index) => {
            const workOrder = findWorkOrderForDate(date, bay.id, workOrders);
            const blocked = isDateBlocked(date);

            // Blocked dates always take precedence
            if (blocked) {
              return (
                <div 
                  key={date.toISOString()}
                  className={cn(
                    "h-full w-full border-b border-r border-gray-700/50",
                    "bg-red-900/20 cursor-not-allowed"
                  )}
                  style={{
                    gridColumn: `${index + 2}`,
                  }}
                />
              );
            }

            // Handle work order spans only if the date is not blocked
            if (workOrder) {
              // Skip non-start days of work order
              if (!isWorkOrderStart(date, workOrder)) {
                return null;
              }

              // Show work order card for start day
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

            // Render empty cell
            return (
              <div 
                key={date.toISOString()}
                className={cn(
                  "h-full w-full border-b border-r border-gray-700/50",
                  "transition-colors hover:bg-gray-700/20 cursor-pointer p-2",
                  isToday(date) && "bg-gray-700/20"
                )}
                onClick={() => onDateSelect?.(date)}
              />
            );
          })}
        </div>
      ))}
    </>
  )
}
