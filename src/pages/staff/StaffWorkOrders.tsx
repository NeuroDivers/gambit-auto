
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageTitle } from "@/components/shared/PageTitle";
import { Card } from "@/components/ui/card";
import { StaffLayout } from "@/components/staff/StaffLayout";
import { LoadingScreen } from "@/components/shared/LoadingScreen";

export default function StaffWorkOrders() {
  const { data: workOrders, isLoading } = useQuery({
    queryKey: ['staff-work-orders'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .eq('assigned_profile_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <StaffLayout>
      <div className="container mx-auto p-6">
        <PageTitle 
          title="My Work Orders"
          description="View and manage your assigned work orders"
        />
        <div className="grid gap-4 mt-6">
          {workOrders?.map((order) => (
            <Card key={order.id} className="p-4">
              {/* Add work order details here */}
            </Card>
          ))}
        </div>
      </div>
    </StaffLayout>
  );
}
