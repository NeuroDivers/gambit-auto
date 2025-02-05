import { ServiceBaysList } from "@/components/service-bays/ServiceBaysList";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function ServiceBays() {
  const navigate = useNavigate();
  const { toast } = useToast();

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
    <DashboardLayout onLogout={handleLogout}>
      <PageBreadcrumbs />
      <ServiceBaysList />
    </DashboardLayout>
  );
}