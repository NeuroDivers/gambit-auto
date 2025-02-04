import { format, isToday } from "date-fns"
import { WorkOrder } from "../types"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { WorkOrderCard } from "./WorkOrderCard"

type CalendarDayProps = {
  date: Date
  workOrders: WorkOrder[]
  isCurrentMonth: boolean
}

export function CalendarDay({ date, workOrders, isCurrentMonth }: CalendarDayProps) {
  return (
    <div 
      className={cn(
        "relative min-h-[120px] p-2 border border-[#e5e7eb]/20 rounded-md transition-all duration-200 day-container",
        !isCurrentMonth && "opacity-50 bg-background/50",
        isToday(date) && "ring-2 ring-primary/30 bg-primary/5",
      )}
    >
      <div className={cn(
        "font-medium text-sm mb-2 day-container",
        isToday(date) && "text-primary font-semibold text-base"
      )}>
        {format(date, 'd')}
      </div>
      <div className="space-y-1">
        {workOrders?.map((workOrder) => (
          <WorkOrderCard
            key={workOrder.id}
            workOrder={workOrder}
          />
        ))}
      </div>
    </div>
  )
}