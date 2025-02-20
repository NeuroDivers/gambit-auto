
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FileText, Pencil } from "lucide-react"
import { format } from "date-fns"
import { WorkOrder } from "../types"
import { useAdminStatus } from "@/hooks/useAdminStatus"

interface WorkOrderTableProps {
  workOrders: WorkOrder[]
  onAssignUser: (workOrder: WorkOrder) => void
  onAssignBay: (workOrder: WorkOrder) => void
  onEdit: (workOrder: WorkOrder) => void
  onCreateInvoice: (workOrderId: string) => void
}

export function WorkOrderTable({
  workOrders,
  onAssignUser,
  onAssignBay,
  onEdit,
  onCreateInvoice
}: WorkOrderTableProps) {
  const { isAdmin } = useAdminStatus()

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Bay</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workOrders && workOrders.length > 0 ? (
            workOrders.map((workOrder) => (
              <TableRow key={workOrder.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">
                      {workOrder.first_name} {workOrder.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">{workOrder.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  {workOrder.vehicle_year} {workOrder.vehicle_make} {workOrder.vehicle_model}
                </TableCell>
                <TableCell>
                  <Badge variant={workOrder.status === 'completed' ? 'default' : 'secondary'}>
                    {workOrder.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span 
                    className={`cursor-pointer ${!workOrder.assigned_to ? 'text-muted-foreground' : ''}`}
                    onClick={() => onAssignUser(workOrder)}
                  >
                    {workOrder.assigned_to ? (
                      `${workOrder.assigned_to.first_name} ${workOrder.assigned_to.last_name}`
                    ) : (
                      "Unassigned"
                    )}
                  </span>
                </TableCell>
                <TableCell>
                  <span 
                    className={`cursor-pointer ${!workOrder.service_bays ? 'text-muted-foreground' : ''}`}
                    onClick={() => onAssignBay(workOrder)}
                  >
                    {workOrder.service_bays ? (
                      workOrder.service_bays.name
                    ) : (
                      "Not assigned"
                    )}
                  </span>
                </TableCell>
                <TableCell>
                  {format(new Date(workOrder.created_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onCreateInvoice(workOrder.id)}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(workOrder)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                No work orders found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
