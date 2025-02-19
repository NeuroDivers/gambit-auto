
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
    let isSubscribed = true;

    const checkUserType = async (userId: string) => {
      try {
        // Use the RPC function instead of direct query to avoid join issues
        const { data: userRole, error } = await supabase
          .rpc('get_user_role', {
            input_user_id: userId
          })
          .maybeSingle();

        if (error) throw error;
        return userRole as UserRole;
      } catch (error) {
        console.error("Error checking user role:", error);
        return null;
      }
    };

    const redirectBasedOnRole = async (session: any) => {
      if (!isSubscribed) return;

      try {
        const userRole = await checkUserType(session.user.id);
        
        if (!userRole) {
          console.log("No role found, redirecting to auth");
          navigate("/auth", { replace: true });
          return;
        }

        const currentPath = location.pathname;
        console.log("Current path:", currentPath, "User type:", userRole.user_type);

        // Only redirect if not already on the correct path
        if (userRole.user_type === 'staff') {
          if (!currentPath.startsWith('/admin') && currentPath !== '/auth') {
            navigate("/admin", { replace: true });
          }
        } else {
          if (!currentPath.startsWith('/client') && currentPath !== '/auth') {
            navigate("/client", { replace: true });
          }
        }
      } catch (error) {
        console.error("Error in redirectBasedOnRole:", error);
        navigate("/auth", { replace: true });
      }
    };

    const checkSession = async () => {
      if (!isSubscribed) return;

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (!session) {
          if (location.pathname !== '/auth') {
            navigate("/auth", { replace: true });
          }
          return;
        }

        // Only redirect from auth page when we have a valid session
        if (location.pathname === '/auth') {
          await redirectBasedOnRole(session);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        if (location.pathname !== '/auth') {
          navigate("/auth", { replace: true });
        }
      }
    };

    // Initial check
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isSubscribed) return;
        
        if (event === 'SIGNED_IN' && session) {
          await redirectBasedOnRole(session);
        } else if (event === 'SIGNED_OUT') {
          navigate("/auth", { replace: true });
        }
      }
    );

    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);
};
