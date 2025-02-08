
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"

type RoleResponse = {
  roles: {
    name: string
  }[]
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

        const { data } = await supabase
          .from('profiles')
          .select(`
            roles!role_id (
              name
            )
          `)
          .eq('id', user.id)
          .single()

        const roles = (data as RoleResponse)?.roles
        setIsAdmin(roles?.[0]?.name === 'administrator')
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
