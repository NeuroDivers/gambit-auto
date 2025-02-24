
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

export const useAuthRedirect = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const checkPermissionsAndRedirect = async (userId: string) => {
      // Get user's role and permissions
      const { data: hasDashboardAccess } = await supabase.rpc('has_permission', {
        user_id: userId,
        resource: 'dashboard',
        perm_type: 'page_access'
      })

      if (hasDashboardAccess) {
        navigate("/dashboard", { replace: true })
        return
      }

      // If no dashboard permissions found
      toast.error("No dashboard access permissions found")
      navigate("/unauthorized", { replace: true })
    }

    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        
        if (session) {
          console.log("Session found:", session)
          await checkPermissionsAndRedirect(session.user.id)
        } else {
          navigate("/auth", { replace: true })
        }
      } catch (error: any) {
        console.error("Session check error:", error.message)
        navigate("/auth", { replace: true })
      }
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await checkPermissionsAndRedirect(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          navigate("/auth", { replace: true })
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [navigate])
}
