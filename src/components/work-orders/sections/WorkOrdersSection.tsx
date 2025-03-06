
import { Badge } from "@/components/ui/badge";
import { WorkOrder } from "../types";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Eye, FileEdit, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WorkOrdersSectionProps {
  workOrders: WorkOrder[];
  onViewDetails?: (workOrder: WorkOrder) => void;
}

export function WorkOrdersSection({ workOrders, onViewDetails }: WorkOrdersSectionProps) {
  const navigate = useNavigate();
  
  if (!workOrders || workOrders.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No unscheduled work orders found
      </div>
    );
  }
  
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string, variant: "default" | "outline" | "secondary" | "destructive" | "success" }> = {
      pending: { label: "Pending", variant: "outline" },
      approved: { label: "Pending", variant: "outline" },
      rejected: { label: "Cancelled", variant: "destructive" },
      in_progress: { label: "In Progress", variant: "secondary" },
      completed: { label: "Completed", variant: "success" },
      cancelled: { label: "Cancelled", variant: "destructive" }
    };

    const { label, variant } = statusMap[status] || { label: status, variant: "outline" };
    
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className="divide-y">
      {workOrders.map((workOrder) => (
        <div key={workOrder.id} className="p-4 hover:bg-muted/50">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">
                  {workOrder.customer_first_name} {workOrder.customer_last_name}
                </h3>
                {getStatusBadge(workOrder.status)}
              </div>
              <p className="text-sm text-muted-foreground">
                {workOrder.vehicle_year} {workOrder.vehicle_make} {workOrder.vehicle_model}
              </p>
              <p className="text-sm text-muted-foreground">
                Created: {formatDate(new Date(workOrder.created_at))}
              </p>
            </div>
            
            <div className="flex gap-2">
              {onViewDetails && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewDetails(workOrder)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate(`/work-orders/${workOrder.id}/edit`)}>
                    <FileEdit className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
