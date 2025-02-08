
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Outlet, Navigate } from "react-router-dom"
import { DashboardLayout } from "./DashboardLayout"
import { LoadingScreen } from "../shared/LoadingScreen"

export function DashboardLayoutWrapper() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
    staleTime: 1000 * 60 * 5, // Keep session fresh for 5 minutes
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      if (!session?.user) return null;
      
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(`
          *,
          role:role_id (
            id,
            name,
            nicename
          )
        `)
        .eq("id", session.user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      return profileData;
    },
    staleTime: 1000 * 60 * 5, // Keep profile fresh for 5 minutes
  });

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      queryClient.clear(); // Clear all queries from cache
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

  // Prefetch the profile data if we have a session
  React.useEffect(() => {
    if (session?.user?.id) {
      queryClient.prefetchQuery({
        queryKey: ["profile", session.user.id],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("profiles")
            .select(`
              *,
              role:role_id (
                id,
                name,
                nicename
              )
            `)
            .eq("id", session.user.id)
            .maybeSingle();

          if (error) throw error;
          return data;
        },
      });
    }
  }, [session?.user?.id, queryClient]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  if (!profile) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <DashboardLayout
      firstName={profile?.first_name}
      role={profile?.role}
      onLogout={handleLogout}
    >
      <Outlet />
    </DashboardLayout>
  );
}
