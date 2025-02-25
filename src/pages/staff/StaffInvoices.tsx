
import { StaffLayout } from "@/components/staff/StaffLayout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { PageTitle } from "@/components/shared/PageTitle";
import { Card } from "@/components/ui/card";

export default function StaffInvoices() {
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

  const { data: invoices } = useQuery({
    queryKey: ['staff-invoices'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          invoice_items!inner(assigned_profile_id)
        `)
        .eq('invoice_items.assigned_profile_id', user.id)
        .order('created_at', { ascending: false });

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
      <div className="container mx-auto p-6">
        <PageTitle 
          title="My Invoices"
          description="View invoices for services you've provided"
        />
        <div className="grid gap-4 mt-6">
          {invoices?.map((invoice) => (
            <Card key={invoice.id} className="p-4">
              {/* Add invoice details here */}
            </Card>
          ))}
        </div>
      </div>
    </StaffLayout>
  );
}
