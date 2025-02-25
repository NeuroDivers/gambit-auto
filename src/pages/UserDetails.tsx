
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageTitle } from "@/components/shared/PageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Check, ChevronLeft, Loader2, Mail, Phone, Shield, UserRound } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

function LoadingState() {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-10" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Handle logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // Invalidate all queries
      queryClient.removeQueries();
      navigate("/auth", { replace: true });
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to log out",
      });
    }
  };

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

  const { data: lastLogin } = useQuery({
    queryKey: ['user-last-login', id],
    queryFn: async () => {
      const { data: { user: authUser }, error } = await supabase.auth.admin.getUserById(id as string);
      if (error) throw error;
      return authUser?.last_sign_in_at;
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
      <DashboardLayout onLogout={handleLogout}>
        <LoadingState />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout onLogout={handleLogout}>
      <div className="container py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/users')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <PageTitle
              title={`${user?.first_name} ${user?.last_name}`}
              description={`${user?.role?.nicename || 'User'}`}
            />
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Last login: {lastLogin ? format(new Date(lastLogin), 'PPp') : 'Never'}
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserRound className="h-5 w-5" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div className="flex items-center gap-2">
                  <dt className="text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </dt>
                  <dd>{user?.email}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <dt className="text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                  </dt>
                  <dd>{user?.phone_number || 'Not provided'}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <dt className="text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                  </dt>
                  <dd>{user?.role?.nicename || 'No role assigned'}</dd>
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
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Check className="h-3 w-3" />
                        {commission.status}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No recent commissions</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Account Created</span>
                  <span>{format(new Date(user?.created_at), 'PPp')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span>{format(new Date(user?.updated_at), 'PPp')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Login</span>
                  <span>{lastLogin ? format(new Date(lastLogin), 'PPp') : 'Never'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
