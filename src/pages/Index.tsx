import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ServiceTypesList } from "@/components/services/ServiceTypesList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { CreateUserDialog } from "@/components/users/CreateUserDialog";
import { ProfileDialog } from "@/components/profile/ProfileDialog";

export default function Index() {
  const navigate = useNavigate();
  
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
    <div className="min-h-screen bg-[#121212]">
      <DashboardLayout />
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex gap-4">
          <CreateUserDialog />
          <ProfileDialog />
        </div>
        <ServiceTypesList />
      </div>
    </div>
  );
}