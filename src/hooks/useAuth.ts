
import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useNavigate } from 'react-router-dom'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Get the current session
    const getInitialSession = async () => {
      setLoading(true)
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          throw error
        }
        
        if (session?.user) {
          setUser(session.user)
          
          // Fetch user profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*, roles(*)')
            .eq('id', session.user.id)
            .single()
          
          if (profileError) {
            console.error('Error fetching profile:', profileError)
          } else if (profileData) {
            setProfile(profileData)
          }
        }
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setLoading(false)
      }
    }
    
    getInitialSession()
    
    // Set up the auth subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          
          // Fetch user profile on auth state change
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*, roles(*)')
            .eq('id', session.user.id)
            .single()
          
          if (profileError) {
            console.error('Error fetching profile:', profileError)
          } else if (profileData) {
            setProfile(profileData)
          }
        } else {
          setUser(null)
          setProfile(null)
        }
        
        setLoading(false)
      }
    )
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])
  
  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }
  
  const signup = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error }
  }
  
  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      navigate('/auth')
    }
    return { error }
  }
  
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error }
  }
  
  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password })
    return { error }
  }

  return {
    user,
    profile,
    loading,
    login,
    signup,
    logout,
    resetPassword,
    updatePassword,
  }
}
