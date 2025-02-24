
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"

interface Role {
  id: string
  name: string
  nicename: string
}

type ProfileWithRole = {
  id: string
  role: Role
}

export const useAuthRedirect = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        
        if (session) {
          console.log("Session found:", session)
          
          // First try to get just the profile
          const profileResult = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single()
            
          console.log("Basic profile query result:", profileResult)

          if (profileResult.error) {
            console.error("Basic profile fetch error:", profileResult.error)
            throw profileResult.error
          }

          // Then get the role information
          const { data, error: profileError } = await supabase
            .from("profiles")
            .select(`
              id,
              role:role_id (
                id,
                name,
                nicename
              )
            `)
            .eq("id", session.user.id)
            .maybeSingle<ProfileWithRole>()

          console.log("Full profile query result:", data)
          console.log("Profile error if any:", profileError)

          if (profileError) {
            console.error("Profile fetch error:", profileError)
            throw profileError
          }

          if (!data) {
            console.error("No profile found")
            navigate("/auth", { replace: true })
            return
          }

          if (!data.role) {
            console.error("No role found in profile:", data)
            navigate("/auth", { replace: true })
            return
          }

          console.log("Profile data with role:", data)

          // Redirect based on role
          const roleName = data.role.name.toLowerCase()
          if (roleName === 'client') {
            console.log("Redirecting to client dashboard")
            navigate("/client", { replace: true })
          } else if (roleName === 'staff') {
            console.log("Redirecting to staff dashboard")
            navigate("/staff", { replace: true })
          } else {
            console.log("Redirecting to admin dashboard")
            navigate("/admin", { replace: true })
          }
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
          // Get the user's role and redirect accordingly
          const { data, error } = await supabase
            .from("profiles")
            .select(`
              id,
              role:role_id (
                id,
                name,
                nicename
              )
            `)
            .eq("id", session.user.id)
            .maybeSingle<ProfileWithRole>()

          if (error || !data) {
            console.error("Error fetching profile:", error)
            navigate("/auth", { replace: true })
            return
          }

          const roleName = data.role.name.toLowerCase()
          if (roleName === 'client') {
            navigate("/client", { replace: true })
          } else if (roleName === 'staff') {
            navigate("/staff", { replace: true })
          } else {
            navigate("/admin", { replace: true })
          }
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
