
import { format, isToday } from "date-fns"
import { WorkOrder } from "@/components/work-orders/types"
import { ServiceBay } from "@/components/service-bays/hooks/useServiceBays"
import { cn } from "@/lib/utils"
import { findWorkOrderForDate, isWorkOrderStart, getWorkOrderSpan } from "../utils/dateUtils"
import { WorkOrderCard } from "./WorkOrderCard"

interface CalendarGridProps {
  days: Date[]
  serviceBays?: ServiceBay[]
  workOrders: WorkOrder[]
  onDateSelect?: (date: Date) => void
  onWorkOrderSelect: (workOrder: WorkOrder) => void
}

export function CalendarGrid({ 
  days, 
  serviceBays, 
  workOrders,
  onDateSelect,
  onWorkOrderSelect
}: CalendarGridProps) {
  return (
    <>
      <div className="grid" style={{ gridTemplateColumns: `100px repeat(${days.length}, 80px)` }}>
        <div className="p-4 text-gray-600 font-medium sticky left-0 bg-white z-10 border-r border-gray-200">Bay</div>
        {days.map((date) => (
          <div 
            key={date.toISOString()}
            className="p-4 text-gray-600 font-medium text-center border-b border-r border-gray-200"
          >
            <div>{format(date, 'EEE')}</div>
            <div>{format(date, 'd')}</div>
          </div>
        ))}
      </div>

      {serviceBays?.map((bay) => (
        <div 
          key={bay.id}
          className="grid"
          style={{ gridTemplateColumns: `100px repeat(${days.length}, 80px)` }}
        >
          <div className="p-4 text-gray-600 sticky left-0 bg-white z-10 border-b border-r border-gray-200">
            {bay.name}
          </div>
          {days.map((date, index) => {
            const workOrder = findWorkOrderForDate(date, bay.id, workOrders);
            
            // Skip rendering empty cells if we're in the middle of a work order span
            if (workOrder && !isWorkOrderStart(date, workOrder)) {
              return null;
            }
            
            if (workOrder && isWorkOrderStart(date, workOrder)) {
              console.log('Rendering work order:', {
                workOrderId: workOrder.id,
                date: date.toISOString(),
                name: `${workOrder.first_name} ${workOrder.last_name}`
              });
              
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

            return (
              <div 
                key={date.toISOString()}
                className={cn(
                  "p-2 relative flex items-center justify-center border-b border-r border-gray-200",
                  "hover:bg-[#E5DEFF] transition-colors cursor-pointer",
                  isToday(date) && "bg-[#E5DEFF]"
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
