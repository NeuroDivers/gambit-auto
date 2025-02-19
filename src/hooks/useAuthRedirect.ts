
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

      console.log("Found user role:", userRole);
      return userRole as UserRole;
    };

    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Session check error:", error.message);
        return;
      }

      // If no session and not on auth page, redirect to auth
      if (!session && location.pathname !== '/auth') {
        console.log("No session, redirecting to auth");
        navigate("/auth", { replace: true });
        return;
      }

      // If we have a session, check if we need to redirect
      if (session) {
        const userRole = await checkUserType(session.user.id);
        const isOnAuthPage = location.pathname === '/auth';
        const isOnClientDashboard = location.pathname.startsWith('/client');
        const isOnAdminDashboard = location.pathname.startsWith('/admin');
        
        if (userRole?.user_type === 'staff') {
          // For staff users
          if (isOnAuthPage || isOnClientDashboard) {
            console.log("Staff user, redirecting to admin dashboard");
            navigate("/admin", { replace: true });
          }
        } else {
          // For client users
          if (isOnAuthPage || isOnAdminDashboard) {
            console.log("Client user, redirecting to client dashboard");
            navigate("/client", { replace: true });
          }
        }
      }
    };

    // Initial check
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        if (event === 'SIGNED_IN' && session) {
          const userRole = await checkUserType(session.user.id);
          
          if (userRole?.user_type === 'staff') {
            console.log("Staff signed in, redirecting to admin dashboard");
            navigate("/admin", { replace: true });
          } else {
            console.log("Client signed in, redirecting to client dashboard");
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
