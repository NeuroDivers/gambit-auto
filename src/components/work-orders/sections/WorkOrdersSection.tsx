
import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Filter, MoreHorizontal, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WorkOrder } from "@/components/work-orders/types";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WorkOrderStatusBadge } from "@/components/work-orders/WorkOrderStatusBadge";
import { WorkOrderDrawer } from "@/components/work-orders/WorkOrderDrawer";

interface WorkOrdersSectionProps {
  workOrders: WorkOrder[];
  onViewDetails?: (workOrder: WorkOrder) => void;
  isLoading?: boolean;
}

export function WorkOrdersSection({ 
  workOrders = [],
  onViewDetails,
  isLoading = false
}: WorkOrdersSectionProps) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>("all");
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  if (workOrders.length === 0) {
    return (
      <EmptyState 
        title="No work orders found"
        description="There are no work orders to display. Create a new work order to get started."
        actionLabel="Create Work Order"
        onAction={() => navigate("/work-orders/create")}
      />
    );
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not scheduled";
    return format(new Date(dateString), "MMM d, yyyy - h:mm a");
  };

  const filteredWorkOrders = filter === "all" 
    ? workOrders 
    : workOrders.filter(wo => wo.status === filter);

  const handleViewDetails = (workOrder: WorkOrder) => {
    if (onViewDetails) {
      onViewDetails(workOrder);
    } else {
      setSelectedWorkOrder(workOrder);
      setDrawerOpen(true);
    }
  };

  const handleEditWorkOrder = (id: string) => {
    navigate(`/work-orders/${id}/edit`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <Tabs value={filter} onValueChange={setFilter} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="invoiced">Invoiced</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWorkOrders.map((workOrder) => (
              <TableRow key={workOrder.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{workOrder.customer_first_name} {workOrder.customer_last_name}</div>
                    <div className="text-sm text-muted-foreground">{workOrder.customer_email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {workOrder.vehicle_year} {workOrder.vehicle_make} {workOrder.vehicle_model}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{formatDate(workOrder.start_time)}</div>
                  {workOrder.service_bays && (
                    <div className="text-xs text-muted-foreground">Bay: {workOrder.service_bays.name}</div>
                  )}
                </TableCell>
                <TableCell>
                  <WorkOrderStatusBadge status={workOrder.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleViewDetails(workOrder)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditWorkOrder(workOrder.id)}>
                          Edit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <WorkOrderDrawer
        workOrder={selectedWorkOrder}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onEdit={() => selectedWorkOrder && handleEditWorkOrder(selectedWorkOrder.id)}
      />
    </div>
  );
}
