
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { LoadingScreen } from "@/components/shared/LoadingScreen"

export default function ClearAuth() {
  const navigate = useNavigate()

  useEffect(() => {
    const clearAuthAndRedirect = async () => {
      try {
        // First attempt to sign out via Supabase
        await supabase.auth.signOut()
        
        // Clear all Supabase auth tokens manually
        localStorage.removeItem('sb-yxssuhzzmxwtnaodgpoq-auth-token')
        localStorage.removeItem('supabase.auth.token')
        localStorage.removeItem('supabase-auth-token')
        
        // Clear any other app storage if needed
        localStorage.removeItem('theme')
        
        // Show success toast
        toast.success('Authentication cleared successfully')
        
        // Redirect to auth page after a brief delay
        setTimeout(() => {
          navigate('/auth', { replace: true })
        }, 1000)
      } catch (error) {
        console.error('Error clearing authentication:', error)
        toast.error('Failed to clear authentication. Please try again.')
        
        // Still redirect to auth page after a longer delay
        setTimeout(() => {
          navigate('/auth', { replace: true })
        }, 2000)
      }
    }

    clearAuthAndRedirect()
  }, [navigate])

  return <LoadingScreen />
}
