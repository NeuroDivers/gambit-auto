import { Badge } from "@/components/ui/badge"
import { CardDescription, CardTitle } from "@/components/ui/card"
import { WorkOrderStatusSelect } from "./WorkOrderStatusSelect"
import { format, parseISO } from "date-fns"
import { WorkOrder } from "../types"

type WorkOrderCardHeaderProps = {
  request: WorkOrder
}

export function WorkOrderCardHeader({ request }: WorkOrderCardHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <CardTitle className="flex items-center gap-2">
          <span>
            {request.first_name} {request.last_name}
          </span>
          <Badge variant="outline" className="text-xs font-normal bg-background/50">
            {request.start_time 
              ? format(parseISO(request.start_time), "MMM d, yyyy")
              : "Unscheduled"}
          </Badge>
        </CardTitle>
        <CardDescription className="text-sm flex items-center gap-2">
          {request.email} • {request.phone_number}
        </CardDescription>
      </div>
      <WorkOrderStatusSelect workOrder={request} />
    </div>
  )
}