
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
    let isSubscribed = true; // For cleanup

    const checkUserType = async (userId: string) => {
      try {
        const { data: userRole, error } = await supabase
          .rpc('get_user_role', {
            input_user_id: userId
          })
          .single();

        if (error) throw error;
        return userRole as UserRole;
      } catch (error) {
        console.error("Error checking user role:", error);
        return null;
      }
    };

    const redirectBasedOnRole = async (session: any) => {
      if (!isSubscribed) return; // Don't redirect if component unmounted

      const userRole = await checkUserType(session.user.id);
      const currentPath = location.pathname;

      // Skip redirect if already on correct path
      if (userRole?.user_type === 'staff') {
        if (!currentPath.startsWith('/admin') && currentPath !== '/auth') {
          navigate("/admin", { replace: true });
        }
      } else {
        if (!currentPath.startsWith('/client') && currentPath !== '/auth') {
          navigate("/client", { replace: true });
        }
      }
    };

    const checkSession = async () => {
      if (!isSubscribed) return;

      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Session check error:", error.message);
        return;
      }

      if (!session) {
        // Only redirect to auth if not already there
        if (location.pathname !== '/auth') {
          navigate("/auth", { replace: true });
        }
        return;
      }

      // If on auth page with valid session, redirect based on role
      if (location.pathname === '/auth') {
        await redirectBasedOnRole(session);
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
