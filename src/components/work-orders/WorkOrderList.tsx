
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
import { format } from "date-fns"
import { WorkOrder } from "./types"
import { Loader2 } from "lucide-react"

export function WorkOrderList() {
  const { data: workOrders, isLoading, error } = useQuery({
    queryKey: ['work-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          assigned_bay:service_bays (
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {workOrders && workOrders.length > 0 ? (
            workOrders.map((workOrder) => (
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
                  {workOrder.assigned_bay ? (
                    workOrder.assigned_bay.name
                  ) : (
                    <span className="text-muted-foreground">Not assigned</span>
                  )}
                </TableCell>
                <TableCell>
                  {format(new Date(workOrder.created_at), 'MMM d, yyyy')}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No work orders found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
