
import { Badge } from "@/components/ui/badge"
import { WorkOrder } from "../types"  // Update this to use our local type
import { Wrench, CalendarDays } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface WorkOrderCardHeaderProps {
  request: WorkOrder
}

export function WorkOrderCardHeader({ request }: WorkOrderCardHeaderProps) {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h3 className="font-semibold text-lg">
            {request.customer_first_name} {request.customer_last_name}
          </h3>
          <div className="flex flex-col text-sm text-muted-foreground">
            <span>{request.customer_email}</span>
            <span>{request.customer_phone}</span>
          </div>
        </div>
        <Badge
          variant={
            request.status === "completed"
              ? "success"
              : request.status === "in_progress"
              ? "outline"
              : request.status === "cancelled"
              ? "destructive"
              : "secondary"
          }
          className="ml-auto"
        >
          {request.status === "in_progress"
            ? "In Progress"
            : request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </Badge>
      </div>
      
      <div className="flex space-x-2 text-xs text-muted-foreground">
        <div className="flex items-center">
          <Wrench className="mr-1 h-3 w-3" />
          <span>
            {request.vehicle_year} {request.vehicle_make} {request.vehicle_model}
          </span>
        </div>
        <div className="flex items-center">
          <CalendarDays className="mr-1 h-3 w-3" />
          <span>{formatDate(request.created_at)}</span>
        </div>
      </div>
    </div>
  )
}
