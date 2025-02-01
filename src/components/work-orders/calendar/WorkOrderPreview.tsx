import { Badge } from "@/components/ui/badge"
import { EditWorkOrderDialog } from "../EditWorkOrderDialog"
import { WorkOrder } from "../types"

type WorkOrderPreviewProps = {
  workOrder: WorkOrder
}

export function WorkOrderPreview({ workOrder }: WorkOrderPreviewProps) {
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <div className="flex justify-between">
          <h4 className="text-sm font-semibold">
            {workOrder.first_name} {workOrder.last_name}
          </h4>
          <Badge variant="outline" className="text-xs">
            {workOrder.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {workOrder.contact_preference === 'email' 
            ? workOrder.email 
            : workOrder.phone_number}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-muted-foreground">Vehicle</p>
          <p>{workOrder.vehicle_year} {workOrder.vehicle_make} {workOrder.vehicle_model}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Serial</p>
          <p>{workOrder.vehicle_serial}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Services</p>
          <p>{workOrder.work_order_services?.map(s => s.service_types.name).join(', ')}</p>
        </div>
      </div>
      {workOrder.additional_notes && (
        <div>
          <p className="text-muted-foreground text-sm">Notes</p>
          <p className="text-sm">{workOrder.additional_notes}</p>
        </div>
      )}
      <div className="pt-2">
        <EditWorkOrderDialog quote={workOrder} />
      </div>
    </div>
  )
}