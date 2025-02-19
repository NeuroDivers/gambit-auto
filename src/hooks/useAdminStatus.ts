
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
  const [isInternalStaff, setIsInternalStaff] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setIsAdmin(false)
          setIsInternalStaff(false)
          return
        }

        // Check if user has a profile (internal staff)
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
          if (profileError.code === 'PGRST116') {
            // Record not found - user is not internal staff
            console.log('User is not internal staff');
            setIsAdmin(false);
            setIsInternalStaff(false);
          } else {
            console.error('Profile fetch error:', profileError);
            setIsAdmin(false);
            setIsInternalStaff(false);
          }
          return;
        }

        // If we have profile data, user is internal staff
        if (profileData) {
          const userRole = (profileData as unknown as ProfileResponse)?.role?.name?.toLowerCase();
          console.log("Internal staff role:", userRole);
          
          setIsInternalStaff(true);
          setIsAdmin(userRole === 'administrator');
        } else {
          setIsInternalStaff(false);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
        setIsInternalStaff(false)
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

  return { isAdmin, isInternalStaff, isLoading }
}
