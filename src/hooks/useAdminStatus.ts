
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"

interface RoleData {
  id: string
  name: string
  nicename: string
}

interface ProfileResponse {
  role: RoleData
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

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select(`
            role:role_id (
              id,
              name,
              nicename
            )
          `)
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          setIsAdmin(false);
          return;
        }

        const userRole = (profileData as unknown as ProfileResponse)?.role?.name?.toLowerCase();
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
