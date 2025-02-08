
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

        const { data } = await supabase
          .from('profiles')
          .select(`
            role:role_id (
              name,
              nicename
            )
          `)
          .eq('id', user.id)
          .single()

        // Use type assertion to tell TypeScript the correct shape
        const response = data as unknown as RoleResponse
        // Log the role name for debugging
        console.log('User role:', response.role?.name)
        // Check if the role contains "admin" (case insensitive)
        setIsAdmin(response.role?.name?.toLowerCase().includes('admin') || false)
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
