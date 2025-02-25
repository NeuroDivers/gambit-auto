
import { WorkOrderCalendar } from "@/components/work-orders/WorkOrderCalendar";
import { StaffLayout } from "@/components/staff/StaffLayout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function StaffCalendar() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
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

  const { data: profile } = useQuery({
    queryKey: ['staff-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

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
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  return (
    <StaffLayout
      firstName={profile?.first_name}
      role={profile?.role}
      onLogout={handleLogout}
    >
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Calendar View</h1>
        <WorkOrderCalendar />
      </div>
    </StaffLayout>
  );
}
