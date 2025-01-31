import * as React from "react"
import { format } from "date-fns"
import { Plus } from "lucide-react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { cn } from "@/lib/utils"
import { WorkOrderDisplay } from "./WorkOrderDisplay"
import type { WorkOrder } from "../types"

interface CalendarDayProps {
  date: Date
  workOrders?: WorkOrder[]
  onSelect: (date: Date) => void
}

export function CalendarDay({ date, workOrders = [], onSelect }: CalendarDayProps) {
  const handleDayClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onSelect(date)
  }

  return (
    <div 
      className="relative h-full w-full min-h-[100px] p-1 group cursor-pointer"
      onClick={handleDayClick}
    >
      <div className="text-sm absolute top-2 left-2">
        {format(date, 'd')}
      </div>
      <Plus className="absolute top-2 right-2 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="pt-8 space-y-1">
        {workOrders.map((order) => (
          <WorkOrderDisplay 
            key={order.id} 
            order={order}
            onClick={(e) => {
              e.stopPropagation() // Prevent day click when clicking on a work order
            }}
          />
        ))}
      </div>
    </div>
  )
}