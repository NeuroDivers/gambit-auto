
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Role {
  id: string;
  name: string;
  nicename: string;
}

interface ProfileResponse {
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
          // Get user role from profiles
          const { data: profileData } = await supabase
            .from("profiles")
            .select(`
              role:role_id (
                id,
                name,
                nicename
              )
            `)
            .eq("id", session.user.id)
            .single();

          // Redirect based on role
          if ((profileData as unknown as ProfileResponse)?.role?.name?.toLowerCase() === 'client') {
            navigate("/client", { replace: true });
          } else {
            navigate("/", { replace: true });
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
          // Get user role
          const { data: profileData } = await supabase
            .from("profiles")
            .select(`
              role:role_id (
                id,
                name,
                nicename
              )
            `)
            .eq("id", session.user.id)
            .single();

          // Redirect based on role
          if ((profileData as unknown as ProfileResponse)?.role?.name?.toLowerCase() === 'client') {
            navigate("/client", { replace: true });
          } else {
            navigate("/", { replace: true });
          }
        } else if (event === 'SIGNED_OUT') {
          navigate("/auth", { replace: true });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);
};
