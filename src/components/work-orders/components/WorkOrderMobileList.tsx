
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { WorkOrder } from "../types";
import { Eye, FileEdit, MoreVertical, Receipt, Wrench } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WorkOrderMobileListProps {
  workOrders: WorkOrder[];
  onAssignBay: (workOrder: WorkOrder) => void;
  onEdit: (workOrder: WorkOrder) => void;
  onCreateInvoice: (workOrderId: string) => void;
  onViewDetails: (workOrder: WorkOrder) => void;
}

export function WorkOrderMobileList({
  workOrders,
  onAssignBay,
  onEdit,
  onCreateInvoice,
  onViewDetails
}: WorkOrderMobileListProps) {
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string, variant: "default" | "outline" | "secondary" | "destructive" | "success" }> = {
      pending: { label: "Pending", variant: "outline" },
      approved: { label: "Pending", variant: "outline" },
      rejected: { label: "Cancelled", variant: "destructive" },
      in_progress: { label: "In Progress", variant: "secondary" },
      completed: { label: "Completed", variant: "success" },
      cancelled: { label: "Cancelled", variant: "destructive" }
    }

    const { label, variant } = statusMap[status] || { label: status, variant: "outline" }
    
    return <Badge variant={variant}>{label}</Badge>
  };

  if (workOrders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No work orders found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {workOrders.map((workOrder) => (
        <Card key={workOrder.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium">
                    {workOrder.customer_first_name} {workOrder.customer_last_name}
                  </h3>
                  {getStatusBadge(workOrder.status)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {workOrder.vehicle_year} {workOrder.vehicle_make} {workOrder.vehicle_model}
                </p>
                <div className="flex flex-wrap gap-x-4 text-sm">
                  <span className="text-muted-foreground">
                    Bay: {workOrder.service_bays?.name || "Unassigned"}
                  </span>
                  <span className="text-muted-foreground">
                    Created: {workOrder.created_at ? formatDate(new Date(workOrder.created_at)) : '-'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewDetails(workOrder)}
                  title="View Details"
                >
                  <Eye className="h-4 w-4" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(workOrder)}>
                      <FileEdit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAssignBay(workOrder)}>
                      <Wrench className="mr-2 h-4 w-4" /> Assign Bay
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onCreateInvoice(workOrder.id)} 
                      disabled={workOrder.status !== 'completed'}
                    >
                      <Receipt className="mr-2 h-4 w-4" /> Create Invoice
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
