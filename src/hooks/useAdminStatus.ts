
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"

type RoleResponse = {
  role: {
    name: string
    nicename: string
  }
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

        const { data: isAdmin, error } = await supabase.rpc(
          'has_role_by_name',
          { 
            user_id: user.id,
            role_name: 'administrator'
          }
        );

        if (error) {
          console.error('Admin check error:', error);
          setIsAdmin(false);
          return;
        }

        setIsAdmin(isAdmin || false);
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
