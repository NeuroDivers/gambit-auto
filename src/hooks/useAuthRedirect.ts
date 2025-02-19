
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();

  useEffect(() => {
    const checkSession = async () => {
      // Don't redirect if we're already on the auth page and there's no session
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Session check error:", error.message);
        return;
      }
      
      // If we're on the auth page and have no session, don't redirect
      if (!session && location.pathname === '/auth') {
        console.log("No session on auth page, staying here");
        return;
      }
      
      // If we're on the auth page and have a session, redirect appropriately
      if (session && location.pathname === '/auth') {
        console.log("Session found on auth page, redirecting...");
        try {
          const { data: profile, error: profileError } = await supabase
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
            .maybeSingle<ProfileWithRole>();

          if (profile?.role?.name?.toLowerCase() === 'client') {
            console.log("Redirecting to client dashboard");
            navigate("/client", { replace: true });
          } else {
            console.log("Redirecting to admin dashboard");
            navigate("/admin", { replace: true });
          }
        } catch (error) {
          console.log("No profile found or error, redirecting to client dashboard");
          navigate("/client", { replace: true });
        }
      }
      
      // If we have no session and we're not on the auth page, redirect to auth
      if (!session && location.pathname !== '/auth') {
        console.log("No session found, redirecting to auth");
        navigate("/auth", { replace: true });
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session);
        
        if (event === 'SIGNED_IN' && session) {
          console.log("User signed in, checking profile");
          try {
            const { data: profile, error: profileError } = await supabase
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
              .maybeSingle<ProfileWithRole>();

            if (profile?.role?.name?.toLowerCase() === 'client') {
              console.log("Redirecting to client dashboard");
              navigate("/client", { replace: true });
            } else {
              console.log("Redirecting to admin dashboard");
              navigate("/admin", { replace: true });
            }
          } catch (error) {
            console.log("No profile found or error, redirecting to client dashboard");
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
  }, [navigate, location.pathname]);
};
