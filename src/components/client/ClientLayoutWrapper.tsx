
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useQuery } from "@tanstack/react-query"
import { Outlet, Navigate } from "react-router-dom"
import { ClientLayout } from "./ClientLayout"

export function ClientLayoutWrapper() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");
      
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();
      
      return { ...profileData, role: roleData?.role };
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!profile) {
    return <Navigate to="/auth" replace />;
  }

  // Non-client users should be redirected to the main dashboard
  if (profile.role !== 'client') {
    return <Navigate to="/" replace />;
  }

  return (
    <ClientLayout
      firstName={profile?.first_name}
      role={profile?.role}
      onLogout={handleLogout}
    >
      <Outlet />
    </ClientLayout>
  );
}
