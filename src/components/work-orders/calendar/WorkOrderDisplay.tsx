import { useState } from "react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { WorkOrderDialog } from "../WorkOrderDialog"
import type { WorkOrder } from "../types"

interface WorkOrderDisplayProps {
  order: WorkOrder
  onClick?: (e: React.MouseEvent) => void
}

export function WorkOrderDisplay({ order, onClick }: WorkOrderDisplayProps) {
  const [isEditing, setIsEditing] = useState(false)
  const primaryService = order.quote_requests?.quote_request_services?.[0]?.service_types
  const serviceColor = getServiceColor(primaryService?.name)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsEditing(true)
  }

  return (
    <div 
      className="relative z-50" 
      onClick={handleClick}
    >
      <HoverCard>
        <HoverCardTrigger asChild>
          <div 
            className={cn(
              "text-xs p-1 rounded text-left truncate transition-all duration-200 hover:scale-[1.02] hover:border hover:shadow-lg cursor-pointer",
              serviceColor
            )}
          >
            {format(new Date(order.start_date), "HH:mm")} - {primaryService?.name}
          </div>
        </HoverCardTrigger>
        <HoverCardContent 
          className="z-[100] bg-popover/95 backdrop-blur supports-[backdrop-filter]:bg-popover/85"
          side="right"
          align="start"
        >
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">{primaryService?.name}</h4>
            <p className="text-xs text-muted-foreground">
              {format(new Date(order.start_date), "PPP HH:mm")} - {format(new Date(order.end_date), "HH:mm")}
            </p>
            {order.notes && (
              <p className="text-xs">{order.notes}</p>
            )}
          </div>
        </HoverCardContent>
      </HoverCard>

      <WorkOrderDialog
        open={isEditing}
        onOpenChange={setIsEditing}
        workOrder={order}
      />
    </div>
  )
}

const getServiceColor = (serviceName?: string) => {
  switch (serviceName?.toLowerCase()) {
    case 'ppf':
      return 'bg-green-500/20 text-green-400 hover:border-green-400/50'
    case 'wrap':
      return 'bg-yellow-500/20 text-yellow-400 hover:border-yellow-400/50'
    case 'ceramic coating':
      return 'bg-blue-500/20 text-blue-400 hover:border-blue-400/50'
    case 'tint':
      return 'bg-purple-500/20 text-purple-400 hover:border-purple-400/50'
    case 'detailing':
      return 'bg-orange-500/20 text-orange-400 hover:border-orange-400/50'
    case 'paint correction':
      return 'bg-red-500/20 text-red-400 hover:border-red-400/50'
    default:
      return 'bg-gray-500/20 text-gray-400 hover:border-gray-400/50'
  }
}