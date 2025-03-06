
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { 
  MoreHorizontal, 
  Warehouse,
  FileEdit,
  Receipt 
} from "lucide-react"
import { WorkOrder } from "../types"
import { formatDate } from "@/lib/utils"
import { WorkOrderStatusSelect } from "./WorkOrderStatusSelect"

interface WorkOrderTableProps {
  workOrders: WorkOrder[]
  onAssignBay: (workOrder: WorkOrder) => void
  onEdit: (workOrder: WorkOrder) => void
  onCreateInvoice: (workOrderId: string) => void
}

export function WorkOrderTable({
  workOrders,
  onAssignBay,
  onEdit,
  onCreateInvoice,
}: WorkOrderTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Vehicle</TableHead>
          <TableHead>Bay</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {workOrders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>
              <div>
                <div className="font-medium">
                  {order.customer_first_name} {order.customer_last_name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {order.customer_email}
                </div>
              </div>
            </TableCell>
            <TableCell>
              {order.vehicle_year} {order.vehicle_make} {order.vehicle_model}
            </TableCell>
            <TableCell 
              onClick={() => onAssignBay(order)}
              className="cursor-pointer hover:bg-muted"
            >
              {order.service_bays?.name || (
                <span className="text-muted-foreground">Unassigned</span>
              )}
            </TableCell>
            <TableCell>
              <WorkOrderStatusSelect workOrder={order} />
            </TableCell>
            <TableCell>{formatDate(order.created_at)}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onAssignBay(order)}>
                    <Warehouse className="mr-2 h-4 w-4" />
                    Assign Bay
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(order)}>
                    <FileEdit className="mr-2 h-4 w-4" />
                    Edit Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onCreateInvoice(order.id)}>
                    <Receipt className="mr-2 h-4 w-4" />
                    Create Invoice
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
