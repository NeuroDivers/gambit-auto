
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { WorkOrder } from "../types"
import { Button } from "@/components/ui/button"
import { Eye, FileEdit, Wrench, Receipt } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { WorkOrderStatusBadge } from "../WorkOrderStatusBadge"

interface WorkOrderTableProps {
  workOrders: WorkOrder[]
  onAssignBay: (workOrder: WorkOrder) => void
  onEdit: (workOrder: WorkOrder) => void
  onCreateInvoice: (workOrder: WorkOrder) => void
  onViewDetails: (workOrder: WorkOrder) => void
}

export function WorkOrderTable({ 
  workOrders, 
  onAssignBay, 
  onEdit, 
  onCreateInvoice,
  onViewDetails
}: WorkOrderTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Bay</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No work orders found
              </TableCell>
            </TableRow>
          ) : (
            workOrders.map((workOrder) => (
              <TableRow key={workOrder.id}>
                <TableCell>
                  <div className="font-medium">
                    {workOrder.customer_first_name} {workOrder.customer_last_name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {workOrder.customer_email}
                  </div>
                </TableCell>
                <TableCell>
                  {workOrder.vehicle_year} {workOrder.vehicle_make} {workOrder.vehicle_model}
                </TableCell>
                <TableCell>
                  <WorkOrderStatusBadge 
                    status={workOrder.status} 
                    workOrderId={workOrder.id}
                    editable={true}
                  />
                </TableCell>
                <TableCell>
                  {workOrder.created_at ? formatDate(workOrder.created_at) : '-'}
                </TableCell>
                <TableCell>
                  {workOrder.service_bays?.name || 'Unassigned'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewDetails(workOrder)}
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(workOrder)}
                      title="Edit"
                    >
                      <FileEdit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onAssignBay(workOrder)}
                      title="Assign Bay"
                    >
                      <Wrench className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onCreateInvoice(workOrder)}
                      title="Create Invoice"
                      disabled={workOrder.status !== 'completed'}
                    >
                      <Receipt className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
