
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
          
          // First try to get just the profile
          const profileResult = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();
            
          console.log("Basic profile query result:", profileResult);

          if (profileResult.error) {
            console.error("Basic profile fetch error:", profileResult.error);
            throw profileResult.error;
          }

          // Then get the role information
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

          console.log("Full profile query result:", data);
          console.log("Profile error if any:", profileError);

          if (profileError) {
            console.error("Profile fetch error:", profileError);
            throw profileError;
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
          
          // First try to get just the profile
          const profileResult = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();
            
          console.log("Basic profile query result:", profileResult);

          if (profileResult.error) {
            console.error("Basic profile fetch error:", profileResult.error);
            navigate("/auth", { replace: true });
            return;
          }

          // Then get the role information
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

          console.log("Full profile query result:", data);
          console.log("Profile error if any:", profileError);

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
