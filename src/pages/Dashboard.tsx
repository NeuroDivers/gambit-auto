import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ServiceTypesList } from "@/components/services/ServiceTypesList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ProfileDialog } from "@/components/profile/ProfileDialog";
import { BusinessSettingsDialog } from "@/components/business/BusinessSettingsDialog";
import { Button } from "@/components/ui/button";
import { Users, Wrench, Receipt } from "lucide-react";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { ServiceBaysList } from "@/components/service-bays/ServiceBaysList";
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs";

export default function Dashboard() {
  const navigate = useNavigate();
  const { isAdmin } = useAdminStatus();
  
  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

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
    <DashboardLayout>
      <PageBreadcrumbs />
      <div className="flex items-center gap-4 mb-8">
        {isAdmin && (
          <>
            <Button
              onClick={() => navigate("/user-management")}
              variant="outline"
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              Manage Users
            </Button>
            <Button
              onClick={() => navigate("/work-orders")}
              variant="outline"
              className="gap-2"
            >
              <Wrench className="h-4 w-4" />
              Work Orders
            </Button>
            <Button
              onClick={() => navigate("/invoices")}
              variant="outline"
              className="gap-2"
            >
              <Receipt className="h-4 w-4" />
              Invoices
            </Button>
          </>
        )}
        <ProfileDialog />
        <BusinessSettingsDialog />
      </div>
      {isAdmin ? (
        <>
          <ServiceTypesList />
          <div className="mt-12">
            <ServiceBaysList />
          </div>
        </>
      ) : (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white/[0.87] mb-6">Welcome to the Dashboard</h2>
          <p className="text-white/60">Please use the navigation menu to access available features.</p>
        </div>
      )}
    </DashboardLayout>
  );
}