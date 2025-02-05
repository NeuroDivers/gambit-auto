import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"
import { ClientList } from "@/components/clients/ClientList"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useQuery } from "@tanstack/react-query"

export default function ClientManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");
      
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      return data;
    },
  });

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      
      navigate("/auth");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <DashboardLayout 
      firstName={profile?.first_name}
      role={profile?.role}
      onLogout={handleLogout}
    >
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
        <div className="container mx-auto py-12">
          <div className="px-6">
            <div className="mb-8">
              <PageBreadcrumbs />
              <h1 className="text-3xl font-bold">Client Management</h1>
            </div>
          </div>
          <div className="max-w-[1600px] mx-auto">
            <ClientList />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}