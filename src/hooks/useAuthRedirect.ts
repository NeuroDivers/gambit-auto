
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
      // Use the new get_user_role RPC function
      const { data: userRole, error } = await supabase
        .rpc('get_user_role', {
          user_id: userId
        })
        .single();

      if (error) {
        console.error("Error checking user role:", error);
        return null;
      }

      if (userRole) {
        console.log("Found user role:", userRole);
        return userRole;
      }

      console.log("No user role found");
      return null;
    };

    const checkSession = async () => {
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
      
      // If we have a session and we're on the auth page, redirect based on role
      if (session && location.pathname === '/auth') {
        console.log("Session found on auth page, checking user type...");
        const userRole = await checkUserType(session.user.id);
        
        if (userRole?.user_type === 'client') {
          console.log("Redirecting client to client dashboard");
          navigate("/client", { replace: true });
        } else if (userRole?.user_type === 'staff') {
          console.log("Redirecting staff to admin dashboard");
          navigate("/admin", { replace: true });
        } else {
          // If no role found but we have a session, assume client
          console.log("No specific role found, defaulting to client dashboard");
          navigate("/client", { replace: true });
        }
        return;
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
        console.log("Auth state changed:", event, session?.user);
        
        if (event === 'SIGNED_IN' && session) {
          console.log("User signed in, checking user type");
          const userRole = await checkUserType(session.user.id);
          
          if (userRole?.user_type === 'client') {
            console.log("Redirecting client to client dashboard");
            navigate("/client", { replace: true });
          } else if (userRole?.user_type === 'staff') {
            console.log("Redirecting staff to admin dashboard");
            navigate("/admin", { replace: true });
          } else {
            // If no role found but we have a session, assume client
            console.log("No specific role found, defaulting to client dashboard");
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
