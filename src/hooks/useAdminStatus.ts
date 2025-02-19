
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"

type RoleData = {
  id: string;
  name: string;
  nicename: string;
}

type ProfileData = {
  id: string;
  role: RoleData;
}

export const useAdminStatus = () => {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setIsAdmin(false)
          return
        }

        // Check profiles table only
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select(`
            id,
            role:role_id (
              id,
              name,
              nicename
            )
          `)
          .eq('id', user.id)
          .returns<ProfileData>()
          .maybeSingle();

        if (profileError) {
          console.error('Error checking admin status:', profileError);
          setIsAdmin(false);
          return;
        }

        const userRole = profileData?.role?.name?.toLowerCase();
        console.log("Checking admin status, user role:", userRole);
        
        // Consider both administrator and king as admin roles
        setIsAdmin(userRole === 'administrator' || userRole === 'king');
      } catch (error) {
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
      } finally {
        setIsLoading(false)
      }
    }

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdminStatus()
    })

    checkAdminStatus()

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { isAdmin, isLoading }
}
