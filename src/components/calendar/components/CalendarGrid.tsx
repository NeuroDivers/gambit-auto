
import { format, isToday } from "date-fns"
import { WorkOrder } from "@/components/work-orders/types"
import { ServiceBay } from "@/components/service-bays/types"
import { cn } from "@/lib/utils"
import { findWorkOrderForDate, getWorkOrderSpan, isWorkOrderStart } from "../utils/dateUtils"
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
      <div className="grid" style={{ gridTemplateColumns: `100px repeat(${days.length}, 200px)` }}>
        <div className="p-4 text-gray-400 font-medium sticky left-0 bg-[#222226] z-10">Bay</div>
        {days.map((date) => (
          <div 
            key={date.toISOString()}
            className="p-4 text-gray-400 font-medium text-center border-b border-gray-700/50"
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
          style={{ gridTemplateColumns: `100px repeat(${days.length}, 200px)` }}
        >
          <div className="p-4 text-gray-300 sticky left-0 bg-[#222226] z-10 border-b border-gray-700/50">
            {bay.name}
          </div>
          {days.map((date, index) => {
            const workOrder = findWorkOrderForDate(date, bay.id, workOrders);
            
            if (workOrder && isWorkOrderStart(date, workOrder)) {
              const span = getWorkOrderSpan(workOrder, index, days.length);
              console.log('Rendering work order:', {
                workOrderId: workOrder.id,
                date: date.toISOString(),
                span,
                name: `${workOrder.first_name} ${workOrder.last_name}`
              });
              
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

            if (workOrder && !isWorkOrderStart(date, workOrder)) {
              return null;
            }

            return (
              <div 
                key={date.toISOString()}
                className={cn(
                  "p-2 relative flex items-center justify-center border-b border-gray-700/50",
                  "hover:bg-gray-700/20 transition-colors cursor-pointer",
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
