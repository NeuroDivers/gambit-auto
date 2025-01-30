import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CreateUserForm } from "@/components/CreateUserForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

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
    <div>
      <DashboardLayout />
      <div className="container mx-auto py-8">
        <div className="max-w-md mx-auto">
          <CreateUserForm />
        </div>
      </div>
    </div>
  );
}