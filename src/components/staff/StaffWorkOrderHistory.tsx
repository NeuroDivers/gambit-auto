
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { formatDistance } from "date-fns"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export function StaffWorkOrderHistory({ profileId }: { profileId: string }) {
  // Fetch work orders assigned to this staff
  const { data: workOrders, isLoading } = useQuery({
    queryKey: ["staffWorkOrders", profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_orders")
        .select(`
          id,
          status,
          created_at,
          updated_at,
          customer_first_name,
          customer_last_name,
          vehicle_make,
          vehicle_model,
          work_order_services!inner(
            id,
            assigned_profile_id
          )
        `)
        .eq("work_order_services.assigned_profile_id", profileId)
        .order("created_at", { ascending: false })
        .limit(20)
      
      if (error) throw error
      
      // Remove duplicates (a staff may be assigned to multiple services in one work order)
      const uniqueWorkOrders = data ? [...new Map(data.map(item => [item.id, item])).values()] : []
      return uniqueWorkOrders
    },
    enabled: !!profileId
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Work Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading work orders...</div>
        ) : !workOrders || workOrders.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No work orders found for this staff member.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    {order.customer_first_name} {order.customer_last_name}
                  </TableCell>
                  <TableCell>
                    {order.vehicle_make} {order.vehicle_model}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>
                    {formatDistance(new Date(order.created_at), new Date(), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  const getVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "success"
      case "in_progress":
        return "warning"
      case "cancelled":
        return "destructive"
      case "invoiced":
        return "default"
      default:
        return "secondary"
    }
  }

  return (
    <Badge variant={getVariant(status)}>
      {status?.replace('_', ' ')}
    </Badge>
  )
}
