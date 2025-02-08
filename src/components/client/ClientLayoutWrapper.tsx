
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useQuery } from "@tanstack/react-query"
import { Outlet, Navigate } from "react-router-dom"
import { ClientLayout } from "./ClientLayout"
import { LoadingScreen } from "../shared/LoadingScreen"

export function ClientLayoutWrapper() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      if (!session?.user) return null;
      
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(`
          *,
          role:role_id (
            name,
            nicename
          )
        `)
        .eq("id", session.user.id)
        .maybeSingle();
      
      if (profileError) throw profileError;
      return profileData;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: false, // Don't retry on error
  });

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear(); // Clear all local storage
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

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !profile) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <ClientLayout
      firstName={profile?.first_name}
      role={profile?.role?.nicename}
      onLogout={handleLogout}
    >
      <Outlet />
    </ClientLayout>
  );
}
