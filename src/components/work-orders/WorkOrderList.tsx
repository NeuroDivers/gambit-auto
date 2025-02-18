
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { WorkOrder } from "./types"
import { Loader2, Search, Pencil } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { EditWorkOrderDialog } from "./EditWorkOrderDialog"
import { useAdminStatus } from "@/hooks/useAdminStatus"

export function WorkOrderList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null)
  const { isAdmin } = useAdminStatus()

  const { data: workOrders, isLoading, error } = useQuery({
    queryKey: ['work-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          service_bays!fk_work_orders_assigned_bay (
            name
          ),
          assigned_to:profiles!assigned_profile_id (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching work orders:', error);
        throw error;
      }
      return data as WorkOrder[];
    }
  });

  const filteredWorkOrders = workOrders?.filter(order => {
    const matchesSearch = (
      order.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vehicle_make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vehicle_model?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Error loading work orders. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search work orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
              {isAdmin && <TableHead className="w-[100px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWorkOrders && filteredWorkOrders.length > 0 ? (
              filteredWorkOrders.map((workOrder) => (
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
                    {workOrder.assigned_to ? (
                      `${workOrder.assigned_to.first_name} ${workOrder.assigned_to.last_name}`
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {workOrder.service_bays ? (
                      workOrder.service_bays.name
                    ) : (
                      <span className="text-muted-foreground">Not assigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(workOrder.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedWorkOrder(workOrder)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={isAdmin ? 7 : 6} className="text-center">
                  No work orders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selectedWorkOrder && (
        <EditWorkOrderDialog
          workOrder={selectedWorkOrder}
          open={!!selectedWorkOrder}
          onOpenChange={(open) => !open && setSelectedWorkOrder(null)}
        />
      )}
    </div>
  );
}
