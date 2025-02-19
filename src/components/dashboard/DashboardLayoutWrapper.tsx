
import React from "react"
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

  const { data: session, isLoading: sessionLoading, error: sessionError } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Session error:", error);
        throw error;
      }
      if (!session) {
        throw new Error("No session found");
      }
      return session;
    },
    retry: false
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
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
    retry: false
  });

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // Invalidate all queries including permissions
      queryClient.removeQueries();
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

  // If there's a session error or no session, redirect to auth
  if (sessionError || (!sessionLoading && !session)) {
    console.log("No session found, redirecting to auth");
    return <Navigate to="/auth" replace />;
  }

  // Show loading screen while checking initial session
  if (sessionLoading || profileLoading) {
    return <LoadingScreen />;
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
