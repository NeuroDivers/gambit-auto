
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();

  useEffect(() => {
    const checkUserType = async (userId: string) => {
      // First check if user is a staff member (has profile)
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
        .eq("id", userId)
        .maybeSingle<ProfileWithRole>();

      if (profile?.role) {
        console.log("Found staff profile with role:", profile.role);
        return profile.role;
      }

      // If not a staff member, check if they're a client
      const { data: client, error: clientError } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (client) {
        console.log("Found client:", client);
        // Clients have a default role
        return { name: "client", nicename: "Client" };
      }

      console.log("No profile or client found");
      return null;
    };

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
        console.log("Session found on auth page, checking user type...");
        const userRole = await checkUserType(session.user.id);
        
        if (userRole?.name.toLowerCase() === 'client') {
          console.log("Redirecting client to client dashboard");
          navigate("/client", { replace: true });
        } else if (userRole) {
          console.log("Redirecting staff to admin dashboard");
          navigate("/admin", { replace: true });
        } else {
          console.log("No role found, defaulting to client dashboard");
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
          console.log("User signed in, checking user type");
          const userRole = await checkUserType(session.user.id);
          
          if (userRole?.name.toLowerCase() === 'client') {
            console.log("Redirecting client to client dashboard");
            navigate("/client", { replace: true });
          } else if (userRole) {
            console.log("Redirecting staff to admin dashboard");
            navigate("/admin", { replace: true });
          } else {
            console.log("No role found, defaulting to client dashboard");
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
