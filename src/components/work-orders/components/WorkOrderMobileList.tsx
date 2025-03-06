
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { WorkOrder } from "../types"
import { Button } from "@/components/ui/button"
import { Edit, ExternalLink, FileText, MapPin } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { WorkOrderStatusBadge } from "../WorkOrderStatusBadge"

interface WorkOrderMobileListProps {
  workOrders: WorkOrder[]
  onAssignBay: (workOrder: WorkOrder) => void
  onEdit: (workOrder: WorkOrder) => void
  onCreateInvoice: (workOrder: WorkOrder) => void
  onViewDetails: (workOrder: WorkOrder) => void
}

export function WorkOrderMobileList({
  workOrders,
  onAssignBay,
  onEdit,
  onCreateInvoice,
  onViewDetails,
}: WorkOrderMobileListProps) {
  return (
    <div className="space-y-4">
      {workOrders.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No work orders found.
          </CardContent>
        </Card>
      ) : (
        workOrders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">
                  {order.customer_first_name} {order.customer_last_name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {formatDate(order.created_at)}
                </p>
              </div>
              <WorkOrderStatusBadge status={order.status} workOrderId={order.id} />
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="space-y-2 mb-4">
                <p className="text-sm">
                  {order.vehicle_year} {order.vehicle_make} {order.vehicle_model}
                  {order.vehicle_color && ` • ${order.vehicle_color}`}
                </p>
                {order.service_bays ? (
                  <p className="text-sm flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    {order.service_bays.name}
                  </p>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => onAssignBay(order)}
                  >
                    Assign Bay
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => onViewDetails(order)}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Details
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => onEdit(order)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => onCreateInvoice(order)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
