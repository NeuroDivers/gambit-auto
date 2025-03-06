
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { WorkOrder } from "../types"
import { Button } from "@/components/ui/button"
import { Clipboard, Edit, ExternalLink, FileText, MoreHorizontal } from "lucide-react"
import { formatDate } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  onViewDetails,
}: WorkOrderTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Bay</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No work orders found.
              </TableCell>
            </TableRow>
          ) : (
            workOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{order.customer_first_name} {order.customer_last_name}</span>
                    <span className="text-sm text-muted-foreground">{order.customer_email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{order.vehicle_year} {order.vehicle_make} {order.vehicle_model}</span>
                    {order.vehicle_vin && (
                      <span className="text-xs text-muted-foreground">{order.vehicle_vin}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{formatDate(order.created_at)}</TableCell>
                <TableCell>
                  <WorkOrderStatusBadge status={order.status} workOrderId={order.id} />
                </TableCell>
                <TableCell>
                  {order.service_bays ? (
                    <span>{order.service_bays.name}</span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAssignBay(order)}
                    >
                      Assign Bay
                    </Button>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewDetails(order)}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(order)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onCreateInvoice(order)}>
                        <FileText className="mr-2 h-4 w-4" />
                        Create Invoice
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
