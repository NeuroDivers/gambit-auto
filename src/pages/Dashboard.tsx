import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { WorkOrderCalendar } from "@/components/work-orders/WorkOrderCalendar";
import { WorkOrdersSection } from "@/components/work-orders/sections/WorkOrdersSection";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
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

  useEffect(() => {
    if (!sessionLoading && !session) {
      navigate("/auth");
    }
  }, [session, navigate, sessionLoading]);

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-primary/60 text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <DashboardLayout onLogout={handleLogout}>
      <div className="p-8 space-y-8">
        <PageBreadcrumbs />
        <WelcomeHeader />
        <div className="grid grid-cols-1 gap-8">
          <WorkOrderCalendar />
          <WorkOrdersSection />
        </div>
      </div>
    </DashboardLayout>
  );
}