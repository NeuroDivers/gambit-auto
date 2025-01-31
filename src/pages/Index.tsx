import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ServiceTypesList } from "@/components/services/ServiceTypesList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { CreateUserDialog } from "@/components/users/CreateUserDialog";
import { ProfileDialog } from "@/components/profile/ProfileDialog";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useAdminStatus } from "@/hooks/useAdminStatus";

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
    <div className="bg-[#121212]">
      <DashboardLayout />
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex items-center gap-4">
          {isAdmin && (
            <Button
              onClick={() => navigate("/user-management")}
              className="bg-[#BB86FC] text-white hover:bg-[#BB86FC]/90"
            >
              <Users className="mr-2 h-4 w-4" />
              Manage Users
            </Button>
          )}
          <CreateUserDialog />
          <ProfileDialog />
        </div>
        <ServiceTypesList />
      </div>
    </div>
  );
}