
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface UserRole {
  role_name: string | null;
  role_nicename: string | null;
  user_type: string | null;
}

export const useAuthRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkUserType = async (userId: string) => {
      const { data: userRole, error } = await supabase
        .rpc('get_user_role', {
          input_user_id: userId
        })
        .single();

      if (error) {
        console.error("Error checking user role:", error);
        return null;
      }

      if (userRole) {
        console.log("Found user role:", userRole);
        return userRole as UserRole;
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
        
        if (userRole?.user_type === 'staff') {
          console.log("Redirecting staff to admin dashboard");
          navigate("/admin", { replace: true });
        } else {
          // All other users (including clients and unknown roles) go to client dashboard
          console.log("Redirecting to client dashboard");
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
          
          if (userRole?.user_type === 'staff') {
            console.log("Redirecting staff to admin dashboard");
            navigate("/admin", { replace: true });
          } else {
            // All other users (including clients and unknown roles) go to client dashboard
            console.log("Redirecting to client dashboard");
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
