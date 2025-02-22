
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileText, Pencil, Tool, User, Warehouse } from "lucide-react"
import { format } from "date-fns"
import { WorkOrder } from "../types"
import { useAdminStatus } from "@/hooks/useAdminStatus"

interface WorkOrderMobileListProps {
  workOrders: WorkOrder[]
  onAssignUser: (workOrder: WorkOrder) => void
  onAssignBay: (workOrder: WorkOrder) => void
  onEdit: (workOrder: WorkOrder) => void
  onCreateInvoice: (workOrderId: string) => void
}

export function WorkOrderMobileList({
  workOrders,
  onAssignUser,
  onAssignBay,
  onEdit,
  onCreateInvoice
}: WorkOrderMobileListProps) {
  const { isAdmin } = useAdminStatus()

  if (!workOrders.length) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        No work orders found
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {workOrders.map((workOrder) => (
        <Card key={workOrder.id} className="p-4 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-medium">{workOrder.first_name} {workOrder.last_name}</h3>
              <p className="text-sm text-muted-foreground">{workOrder.email}</p>
            </div>
            <Badge variant={workOrder.status === 'completed' ? 'default' : 'secondary'}>
              {workOrder.status}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Tool className="h-4 w-4" />
                {workOrder.vehicle_year} {workOrder.vehicle_make} {workOrder.vehicle_model}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span 
                className="cursor-pointer hover:text-foreground transition-colors"
                onClick={() => onAssignUser(workOrder)}
              >
                {workOrder.assigned_to ? (
                  `${workOrder.assigned_to.first_name} ${workOrder.assigned_to.last_name}`
                ) : (
                  "Unassigned"
                )}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Warehouse className="h-4 w-4" />
              <span 
                className="cursor-pointer hover:text-foreground transition-colors"
                onClick={() => onAssignBay(workOrder)}
              >
                {workOrder.service_bays ? (
                  workOrder.service_bays.name
                ) : (
                  "Not assigned"
                )}
              </span>
            </div>

            <div className="text-sm text-muted-foreground">
              Created: {format(new Date(workOrder.created_at), 'MMM d, yyyy')}
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCreateInvoice(workOrder.id)}
            >
              <FileText className="h-4 w-4" />
            </Button>
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(workOrder)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}
