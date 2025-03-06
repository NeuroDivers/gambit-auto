
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

// Sort function for service bays
const sortServiceBays = (bays: ServiceBay[]): ServiceBay[] => {
  return [...bays].sort((a, b) => {
    // Extract numbers from bay names
    const aNumberMatch = a.name.match(/(\d+)/)
    const bNumberMatch = b.name.match(/(\d+)/)
    
    // Both have numbers, sort numerically
    if (aNumberMatch && bNumberMatch) {
      return parseInt(aNumberMatch[1], 10) - parseInt(bNumberMatch[1], 10)
    }
    
    // Only a has a number, it comes first
    if (aNumberMatch) return -1
    
    // Only b has a number, it comes first
    if (bNumberMatch) return 1
    
    // Neither has a number, sort alphabetically
    return a.name.localeCompare(b.name)
  })
}

export function CalendarContent({ 
  days, 
  serviceBays, 
  workOrders, 
  isDateBlocked,
  onDateSelect,
  onWorkOrderSelect
}: CalendarContentProps) {
  // Sort the service bays before rendering
  const sortedBays = serviceBays ? sortServiceBays(serviceBays) : []
  
  return (
    <>
      {sortedBays.map((bay) => (
        <div 
          key={bay.id}
          className="grid"
          style={{ gridTemplateColumns: `80px repeat(${days.length}, minmax(60px, 1fr))` }}
        >
          <div className="p-2 text-gray-600 sticky left-0 bg-white z-10 border-b border-r border-gray-200 text-sm font-medium">
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
                    "h-full w-full border-b border-r border-gray-200",
                    "bg-red-50 cursor-not-allowed"
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
                  "h-full w-full border-b border-r border-gray-200",
                  "transition-colors hover:bg-gray-50 cursor-pointer p-2",
                  isToday(date) && "bg-gray-50"
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
