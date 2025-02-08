
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useQuery } from "@tanstack/react-query"
import { Outlet, Navigate } from "react-router-dom"
import { DashboardLayout } from "./DashboardLayout"
import { LoadingScreen } from "../shared/LoadingScreen"

export function DashboardLayoutWrapper() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Session error:", sessionError);
        throw sessionError;
      }
      
      if (!session?.user) {
        console.log("No session found, redirecting to auth");
        throw new Error("No authenticated user");
      }

      console.log("Session found, fetching profile for user:", session.user.id);
      
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
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        throw profileError;
      }

      console.log("Fetched profile data:", profileData);
      return profileData;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
  });

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      
      navigate("/auth", { replace: true });
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to log out",
      });
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    console.error("Profile fetch error, redirecting to auth:", error);
    navigate("/auth", { replace: true });
    return null;
  }

  if (!profile) {
    console.log("No profile found, redirecting to auth");
    return <Navigate to="/auth" replace />;
  }

  console.log("Rendering DashboardLayout with profile:", profile);

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
