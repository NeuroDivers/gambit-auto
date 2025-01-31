import * as React from "react"
import { format } from "date-fns"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { cn } from "@/lib/utils"
import { WorkOrderDialog } from "../WorkOrderDialog"
import type { WorkOrder } from "../types"

interface WorkOrderDisplayProps {
  order: WorkOrder
}

export function WorkOrderDisplay({ order }: WorkOrderDisplayProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  
  // Get the primary service type for color coding
  const primaryService = order.quote_requests?.quote_request_services?.[0]?.service_types
  const serviceColor = getServiceColor(primaryService?.name)

  return (
    <>
      <HoverCard>
        <HoverCardTrigger>
          <div 
            onClick={() => setIsEditing(true)}
            className={cn(
              "text-xs p-1 rounded text-left truncate transition-all duration-200 hover:scale-[1.02] hover:border hover:shadow-lg cursor-pointer",
              serviceColor
            )}
          >
            {format(new Date(order.start_date), "HH:mm")} - {order.quote_requests?.first_name}
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          {renderWorkOrderContent(order)}
        </HoverCardContent>
      </HoverCard>

      <WorkOrderDialog
        open={isEditing}
        onOpenChange={setIsEditing}
        workOrder={order}
      />
    </>
  )
}

function getServiceColor(serviceName?: string) {
  switch (serviceName?.toLowerCase()) {
    case 'oil change':
      return 'bg-blue-500/20 text-blue-400 hover:border-blue-400/50'
    case 'tire rotation':
      return 'bg-green-500/20 text-green-400 hover:border-green-400/50'
    case 'brake service':
      return 'bg-red-500/20 text-red-400 hover:border-red-400/50'
    case 'engine repair':
      return 'bg-yellow-500/20 text-yellow-400 hover:border-yellow-400/50'
    default:
      return 'bg-purple-500/20 text-purple-400 hover:border-purple-400/50'
  }
}

function renderWorkOrderContent(order: WorkOrder) {
  const services = order.quote_requests?.quote_request_services?.map(
    (s) => s.service_types.name
  ).join(", ")

  return (
    <div className="space-y-2">
      <h4 className="font-semibold">
        {order.quote_requests?.first_name} {order.quote_requests?.last_name}
      </h4>
      <div className="text-sm space-y-1">
        <p>Time: {format(new Date(order.start_date), "HH:mm")}</p>
        <p>Services: {services}</p>
        <p>Status: {order.status}</p>
        <p>Bay: {order.service_bays?.name}</p>
      </div>
    </div>
  )
}