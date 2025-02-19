
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"

export const useAdminStatus = () => {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isInternalStaff, setIsInternalStaff] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Get current user's role using the get_user_role RPC function
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          console.log("No user found");
          setIsAdmin(false)
          setIsInternalStaff(false)
          return
        }

        const { data: roleData, error: roleError } = await supabase
          .rpc('get_user_role', {
            input_user_id: user.id
          })

        if (roleError) {
          console.error('Error checking role:', roleError)
          setIsAdmin(false)
          setIsInternalStaff(false)
          return
        }

        // If we have role data, check if user is administrator
        if (roleData) {
          console.log("User role data:", roleData)
          const isAdminRole = roleData.role_name === 'administrator';
          console.log("Is admin role:", isAdminRole);
          setIsAdmin(isAdminRole)
          setIsInternalStaff(roleData.user_type === 'staff')
        } else {
          console.log("No role data found");
          setIsAdmin(false)
          setIsInternalStaff(false)
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
        setIsInternalStaff(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminStatus()
  }, [])

  return { isAdmin, isInternalStaff, isLoading }
}
