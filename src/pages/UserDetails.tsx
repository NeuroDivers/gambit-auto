
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageTitle } from "@/components/shared/PageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Check, ChevronLeft, Loader2, Mail, Phone, Shield, UserRound, Briefcase, Building, IdCard, Calendar as CalendarIcon, ClockIcon, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ServiceSkillsManager } from "@/components/staff/skills/ServiceSkillsManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { UserEditDialog } from "@/components/users/UserEditDialog";

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
  const [editDialogOpen, setEditDialogOpen] = useState(false);

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

  const { data: staffData, isLoading: staffLoading } = useQuery({
    queryKey: ['staff-details', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('profile_id', id)
        .single();
      
      if (error) {
        console.error("Error fetching staff data:", error);
        return null; // Return null if no staff record exists
      }
      return data;
    },
    enabled: !!id
  });

  const { data: lastLogin } = useQuery({
    queryKey: ['user-last-login', id],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user.id === id) {
        return session.user.last_sign_in_at;
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('updated_at')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data.updated_at;
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

  if (userLoading || workOrdersLoading || commissionsLoading || staffLoading) {
    return <LoadingState />;
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/staff-management')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <PageTitle
            title={`${user?.first_name} ${user?.last_name}`}
            description={`${user?.role?.nicename || 'User'}`}
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Last login: {lastLogin ? format(new Date(lastLogin), 'PPp') : 'Never'}
          </Badge>
          <Button onClick={() => setEditDialogOpen(true)}>
            Edit User
          </Button>
        </div>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="info">User Information</TabsTrigger>
          <TabsTrigger value="skills">Service Skills</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info">
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
                </dl>
              </CardContent>
            </Card>

            {staffData && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Staff Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-2">
                      <div className="flex items-center gap-2">
                        <dt className="text-sm text-muted-foreground">
                          <IdCard className="h-4 w-4" />
                        </dt>
                        <dd>Employee ID: {staffData?.employee_id || 'Not assigned'}</dd>
                      </div>
                      <div className="flex items-center gap-2">
                        <dt className="text-sm text-muted-foreground">
                          <Briefcase className="h-4 w-4" />
                        </dt>
                        <dd>Position: {staffData?.position || 'Not specified'}</dd>
                      </div>
                      <div className="flex items-center gap-2">
                        <dt className="text-sm text-muted-foreground">
                          <Building className="h-4 w-4" />
                        </dt>
                        <dd>Department: {staffData?.department || 'Not specified'}</dd>
                      </div>
                      <div className="flex items-center gap-2">
                        <dt className="text-sm text-muted-foreground">
                          <CalendarIcon className="h-4 w-4" />
                        </dt>
                        <dd>Hired: {staffData?.employment_date ? format(new Date(staffData.employment_date), 'PPP') : 'Not specified'}</dd>
                      </div>
                      <div className="flex items-center gap-2">
                        <dt className="text-sm text-muted-foreground">
                          <ClockIcon className="h-4 w-4" />
                        </dt>
                        <dd>Status: {staffData?.status || 'Active'}</dd>
                      </div>
                      <div className="flex items-center gap-2">
                        <dt className="text-sm text-muted-foreground">
                          Employment:
                        </dt>
                        <dd>{staffData?.is_full_time ? 'Full-time' : 'Part-time'}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Staff Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-2">
                      {staffData?.street_address && (
                        <div>
                          <dt className="text-sm text-muted-foreground">Street Address</dt>
                          <dd>{staffData.street_address}</dd>
                        </div>
                      )}
                      {staffData?.unit_number && (
                        <div>
                          <dt className="text-sm text-muted-foreground">Unit/Apt #</dt>
                          <dd>{staffData.unit_number}</dd>
                        </div>
                      )}
                      {staffData?.city && (
                        <div>
                          <dt className="text-sm text-muted-foreground">City</dt>
                          <dd>{staffData.city}</dd>
                        </div>
                      )}
                      {staffData?.state_province && (
                        <div>
                          <dt className="text-sm text-muted-foreground">State/Province</dt>
                          <dd>{staffData.state_province}</dd>
                        </div>
                      )}
                      {staffData?.postal_code && (
                        <div>
                          <dt className="text-sm text-muted-foreground">Postal/ZIP Code</dt>
                          <dd>{staffData.postal_code}</dd>
                        </div>
                      )}
                      {staffData?.country && (
                        <div>
                          <dt className="text-sm text-muted-foreground">Country</dt>
                          <dd>{staffData.country}</dd>
                        </div>
                      )}
                      {!staffData?.street_address && !staffData?.city && !staffData?.postal_code && (
                        <p className="text-sm text-muted-foreground">No address information provided</p>
                      )}
                    </dl>
                  </CardContent>
                </Card>
              </>
            )}

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
        </TabsContent>
        
        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Service Skills Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ServiceSkillsManager profileId={id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {user && (
        <UserEditDialog 
          user={user} 
          open={editDialogOpen} 
          onOpenChange={setEditDialogOpen} 
        />
      )}
    </div>
  );
}
