
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Role {
  id: string;
  name: string;
  nicename: string;
}

interface Profile {
  id: string;
  role: Role;  // This is a single role object, not an array
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
          // Get user role from profiles
          const { data: profileData, error: profileError } = await supabase
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
            .single();

          if (profileError) {
            console.error("Profile fetch error:", profileError);
            throw profileError;
          }

          console.log("Profile data:", profileData);

          // Redirect based on role
          if (profileData?.role?.name?.toLowerCase() === 'client') {
            console.log("Redirecting to client dashboard");
            navigate("/client", { replace: true });
          } else {
            console.log("Redirecting to admin dashboard");
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
        
        if (event === 'SIGNED_IN' && session) {
          console.log("User signed in, fetching profile");
          // Get user role
          const { data: profileData, error: profileError } = await supabase
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
            .single();

          if (profileError) {
            console.error("Profile fetch error:", profileError);
            throw profileError;
          }

          console.log("Profile data after sign in:", profileData);

          // Redirect based on role
          if (profileData?.role?.name?.toLowerCase() === 'client') {
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
