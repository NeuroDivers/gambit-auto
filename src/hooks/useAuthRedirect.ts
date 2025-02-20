
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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
          // Get user role from profiles with more detailed logging
          console.log("Fetching profile for user ID:", session.user.id);
          
          const { data, error: profileError } = await supabase
            .from("profiles")
            .select(`
              id,
              role:role_id (
                id,
                name,
                nicename
              )
            `)
            .eq("id", session.user.id)
            .maybeSingle<ProfileWithRole>();

          if (profileError) {
            console.error("Profile fetch error:", profileError);
            throw profileError;
          }

          console.log("Raw profile query result:", data);

          if (!data) {
            console.error("No profile found");
            navigate("/auth", { replace: true });
            return;
          }

          if (!data.role) {
            console.error("No role found in profile:", data);
            navigate("/auth", { replace: true });
            return;
          }

          console.log("Profile data with role:", data);

          // Redirect based on role
          if (data.role.name.toLowerCase() === 'client') {
            console.log("Redirecting to client dashboard");
            navigate("/client", { replace: true });
          } else {
            console.log("Redirecting to admin dashboard");
            navigate("/admin", { replace: true });
          }
        }
      } catch (error: any) {
        console.error("Session check error:", error.message);
        navigate("/auth", { replace: true });
      }
    };

    checkSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session);
        
        if (event === 'SIGNED_IN' && session) {
          console.log("User signed in, fetching profile for ID:", session.user.id);
          
          // Get user role with more detailed logging
          const { data, error: profileError } = await supabase
            .from("profiles")
            .select(`
              id,
              role:role_id (
                id,
                name,
                nicename
              )
            `)
            .eq("id", session.user.id)
            .maybeSingle<ProfileWithRole>();

          console.log("Profile query result:", data);

          if (profileError) {
            console.error("Profile fetch error:", profileError);
            navigate("/auth", { replace: true });
            return;
          }

          if (!data) {
            console.error("No profile found");
            navigate("/auth", { replace: true });
            return;
          }

          if (!data.role) {
            console.error("No role found in profile:", data);
            navigate("/auth", { replace: true });
            return;
          }

          console.log("Profile data with role:", data);

          // Redirect based on role
          if (data.role.name.toLowerCase() === 'client') {
            console.log("Redirecting to client dashboard");
            navigate("/client", { replace: true });
          } else {
            console.log("Redirecting to admin dashboard");
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
