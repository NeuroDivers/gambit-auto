
import { Card } from "@/components/ui/card"
import { Calendar, User, Car, ArrowRight } from "lucide-react"
import { format } from "date-fns"
import { WorkOrderStatusBadge } from "../WorkOrderStatusBadge"
import { WorkOrder } from "../types"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

interface WorkOrderMobileListProps {
  workOrders: WorkOrder[]
  onAssignBay: (workOrder: WorkOrder) => void
  onEdit: (workOrder: WorkOrder) => void
  onCreateInvoice: (workOrder: WorkOrder) => void
}

export function WorkOrderMobileList({
  workOrders,
  onAssignBay,
  onEdit,
  onCreateInvoice
}: WorkOrderMobileListProps) {
  if (!workOrders.length) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        No work orders found
      </Card>
    )
  }

  const formatDate = (date: string | null) => {
    if (!date) return "Not scheduled"
    return format(new Date(date), "MMM d, yyyy")
  }

  return (
    <div className="space-y-4">
      {workOrders.map((workOrder) => (
        <Card
          key={workOrder.id}
          className="overflow-hidden"
        >
          <div className="p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-medium truncate mr-2">
                {workOrder.customer_first_name} {workOrder.customer_last_name}
              </h3>
              <WorkOrderStatusBadge 
                status={workOrder.status} 
                workOrderId={workOrder.id}
                editable={true}
              />
            </div>
            
            <div className="grid gap-2 text-sm">
              <div className="flex items-center text-muted-foreground">
                <Car className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">
                  {workOrder.vehicle_year} {workOrder.vehicle_make} {workOrder.vehicle_model}
                </span>
              </div>

              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{formatDate(workOrder.start_time)}</span>
              </div>

              <div className="flex items-center text-muted-foreground">
                <User className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{workOrder.customer_email}</span>
              </div>
            </div>
            
            <div className="flex justify-end mt-3">
              <Link to={`/work-orders/${workOrder.id}`}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs"
                >
                  View Details
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
