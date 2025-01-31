import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ServiceTypesList } from "@/components/services/ServiceTypesList";
import { QuoteRequestForm } from "@/components/quotes/QuoteRequestForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ProfileDialog } from "@/components/profile/ProfileDialog";
import { BusinessSettingsDialog } from "@/components/business/BusinessSettingsDialog";
import { Button } from "@/components/ui/button";
import { Users, ClipboardList } from "lucide-react";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { CreateQuoteDialog } from "@/components/quotes/CreateQuoteDialog";
import { ServiceBaysList } from "@/components/service-bays/ServiceBaysList";

export default function Index() {
  const navigate = useNavigate();
  const { isAdmin } = useAdminStatus();
  
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  useEffect(() => {
    if (!session) {
      navigate("/auth");
    }
  }, [session, navigate]);

  if (!session) {
    return null;
  }

  return (
    <DashboardLayout>
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
              onClick={() => navigate("/quote-requests")}
              variant="outline"
              className="gap-2"
            >
              <ClipboardList className="h-4 w-4" />
              Quote Requests
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
          <h2 className="text-2xl font-bold text-white/[0.87] mb-6">Request a Quote</h2>
          <QuoteRequestForm />
        </div>
      )}
    </DashboardLayout>
  );
}