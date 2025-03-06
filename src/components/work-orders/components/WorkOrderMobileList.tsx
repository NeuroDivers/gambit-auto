
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
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

interface WorkOrderMobileListProps {
  workOrders: WorkOrder[]
  onAssignBay: (workOrder: WorkOrder) => void
  onEdit: (workOrder: WorkOrder) => void
  onCreateInvoice: (workOrderId: string) => void
}

export function WorkOrderMobileList({
  workOrders,
  onAssignBay,
  onEdit,
  onCreateInvoice,
}: WorkOrderMobileListProps) {
  return (
    <div className="space-y-4">
      {workOrders.map((order) => (
        <Card key={order.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {order.customer_first_name} {order.customer_last_name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {order.customer_email}
                </div>
              </div>
              <WorkOrderStatusSelect workOrder={order} />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <div className="text-sm font-medium">Vehicle</div>
              <div className="text-sm text-muted-foreground">
                {order.vehicle_year} {order.vehicle_make} {order.vehicle_model}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">Bay</div>
              <div className="text-sm text-muted-foreground">
                {order.service_bays?.name || "Unassigned"}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">Created</div>
              <div className="text-sm text-muted-foreground">
                {formatDate(order.created_at)}
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
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
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
