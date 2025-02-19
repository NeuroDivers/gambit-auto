
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
  role: Role;
}

export const useAuthRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (!session?.user) {
          console.log("No session found, redirecting to auth");
          navigate("/auth", { replace: true });
          return;
        }

        console.log("Session found, checking profile...");
        // Get user profile and role
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
          .single<Profile>();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          throw profileError;
        }

        if (!profileData?.role) {
          console.log("No role found");
          navigate("/unauthorized", { replace: true });
          return;
        }

        console.log("Profile found:", profileData);

        // Redirect based on role
        const roleName = profileData.role.name.toLowerCase();
        if (roleName === 'client') {
          navigate("/client", { replace: true });
        } else if (roleName === 'administrator' || roleName === 'admin') {
          navigate("/admin", { replace: true });
        } else {
          console.log("Unknown role:", roleName);
          navigate("/unauthorized", { replace: true });
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
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log("User signed in, fetching profile");
          // Get user profile and role
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
            .single<Profile>();

          if (profileError) {
            console.error("Profile fetch error:", profileError);
            navigate("/unauthorized", { replace: true });
            return;
          }

          if (!profileData?.role) {
            console.log("No role found after sign in");
            navigate("/unauthorized", { replace: true });
            return;
          }

          console.log("Profile found after sign in:", profileData);

          // Redirect based on role
          const roleName = profileData.role.name.toLowerCase();
          if (roleName === 'client') {
            navigate("/client", { replace: true });
          } else if (roleName === 'administrator' || roleName === 'admin') {
            navigate("/admin", { replace: true });
          } else {
            console.log("Unknown role:", roleName);
            navigate("/unauthorized", { replace: true });
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
