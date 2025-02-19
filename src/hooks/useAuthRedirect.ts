
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const useAuthRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          console.log("Session found, checking profile...");
          // Get user profile and role
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select(`
              id,
              role:role_id!inner (
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

          if (!profileData) {
            console.log("No profile found");
            navigate("/unauthorized", { replace: true });
            return;
          }

          console.log("Profile found:", profileData);

          // Redirect based on role
          const roleName = profileData.role?.name?.toLowerCase();
          if (roleName === 'client') {
            navigate("/client", { replace: true });
          } else {
            navigate("/admin", { replace: true });
          }
        }
      } catch (error: any) {
        console.error("Session check error:", error.message);
      }
    };

    checkSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log("User signed in, checking profile");
          // Get user profile and role
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select(`
              id,
              role:role_id!inner (
                id,
                name,
                nicename
              )
            `)
            .eq("id", session.user.id)
            .single();

          if (profileError) {
            console.error("Profile fetch error:", profileError);
            navigate("/unauthorized", { replace: true });
            return;
          }

          if (!profileData) {
            console.log("No profile found after sign in");
            navigate("/unauthorized", { replace: true });
            return;
          }

          console.log("Profile found after sign in:", profileData);

          // Redirect based on role
          const roleName = profileData.role?.name?.toLowerCase();
          if (roleName === 'client') {
            navigate("/client", { replace: true });
          } else {
            navigate("/admin", { replace: true });
          }
        } else if (event === 'SIGNED_OUT') {
          console.log("User signed out, redirecting to auth");
          navigate("/auth", { replace: true });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);
};
