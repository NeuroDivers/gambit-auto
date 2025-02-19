
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types/database";

interface Role {
  id: string;
  name: string;
  nicename: string;
}

type ProfileWithRole = {
  id: string;
  role: Role;
}

export const useAuthRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session) {
          console.log("Session found:", session);
          try {
            // Get user role from profiles
            const { data, error: profileError } = await supabase
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
              .single<ProfileWithRole>();

            if (profileError && profileError.code !== 'PGRST116') {
              console.error("Profile fetch error:", profileError);
              // If no profile found, assume it's a client
              console.log("No profile found, redirecting to client dashboard");
              navigate("/client", { replace: true });
              return;
            }

            console.log("Profile data:", data);

            // Redirect based on role
            if (data?.role?.name?.toLowerCase() === 'client') {
              console.log("Redirecting to client dashboard");
              navigate("/client", { replace: true });
            } else {
              console.log("Redirecting to admin dashboard");
              navigate("/admin", { replace: true });
            }
          } catch (error) {
            // If any error occurs during profile check, default to client view
            console.error("Error during profile check:", error);
            navigate("/client", { replace: true });
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
        
        if (event === 'SIGNED_IN' && session) {
          console.log("User signed in, checking profile");
          try {
            // Get user role
            const { data, error: profileError } = await supabase
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
              .single<ProfileWithRole>();

            if (profileError && profileError.code !== 'PGRST116') {
              console.log("No profile found or error, redirecting to client dashboard");
              navigate("/client", { replace: true });
              return;
            }

            console.log("Profile data after sign in:", data);

            // Redirect based on role
            if (data?.role?.name?.toLowerCase() === 'client') {
              console.log("Redirecting to client dashboard");
              navigate("/client", { replace: true });
            } else {
              console.log("Redirecting to admin dashboard");
              navigate("/admin", { replace: true });
            }
          } catch (error) {
            // If any error occurs during profile check, default to client view
            console.error("Error during profile check:", error);
            navigate("/client", { replace: true });
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
