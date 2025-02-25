
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageTitle } from "@/components/shared/PageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export default function UserDetails() {
  const { id } = useParams();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          role:role_id (
            id,
            name,
            nicename
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: workOrders, isLoading: workOrdersLoading } = useQuery({
    queryKey: ['user-work-orders', id],
    queryFn: async () => {
      const currentDate = new Date().toISOString();
      
      const { data: activeOrders, error: activeError } = await supabase
        .from('work_orders')
        .select('*')
        .eq('assigned_profile_id', id)
        .neq('status', 'completed')
        .order('start_time', { ascending: true });
      
      if (activeError) throw activeError;

      const { data: futureOrders, error: futureError } = await supabase
        .from('work_orders')
        .select('*')
        .eq('assigned_profile_id', id)
        .gt('start_time', currentDate)
        .order('start_time', { ascending: true });
      
      if (futureError) throw futureError;

      return {
        active: activeOrders || [],
        future: futureOrders || []
      };
    }
  });

  const { data: commissions, isLoading: commissionsLoading } = useQuery({
    queryKey: ['user-commissions', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('commission_transactions')
        .select('*')
        .eq('profile_id', id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    }
  });

  if (userLoading || workOrdersLoading || commissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <PageTitle
        title={`${user?.first_name} ${user?.last_name}`}
        description={`${user?.role?.nicename || 'User'}`}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-muted-foreground">Email</dt>
                <dd>{user?.email}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Phone</dt>
                <dd>{user?.phone_number || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Address</dt>
                <dd>{user?.address || 'Not provided'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Work Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {workOrders?.active && workOrders.active.length > 0 ? (
              <ul className="space-y-2">
                {workOrders.active.map((order) => (
                  <li key={order.id} className="text-sm">
                    <time className="text-muted-foreground">
                      {format(new Date(order.start_time), 'MMM dd, yyyy')}
                    </time>
                    <div className="font-medium">{order.vehicle_make} {order.vehicle_model}</div>
                    <div className="text-xs text-muted-foreground">Status: {order.status}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No active work orders</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Future Work Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {workOrders?.future && workOrders.future.length > 0 ? (
              <ul className="space-y-2">
                {workOrders.future.map((order) => (
                  <li key={order.id} className="text-sm">
                    <time className="text-muted-foreground">
                      {format(new Date(order.start_time), 'MMM dd, yyyy')}
                    </time>
                    <div className="font-medium">{order.vehicle_make} {order.vehicle_model}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming work orders</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Commissions</CardTitle>
          </CardHeader>
          <CardContent>
            {commissions && commissions.length > 0 ? (
              <ul className="space-y-2">
                {commissions.map((commission) => (
                  <li key={commission.id} className="text-sm">
                    <time className="text-muted-foreground">
                      {format(new Date(commission.created_at), 'MMM dd, yyyy')}
                    </time>
                    <div className="font-medium">${commission.amount}</div>
                    <div className="text-xs text-muted-foreground">Status: {commission.status}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No recent commissions</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
