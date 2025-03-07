
import { useState, useEffect, createContext, useContext } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/components/ui/use-toast"

type AuthContextType = {
  user: any
  profile: any
  loading: boolean
  error: Error | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  setAuthError: (error: Error | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true)
        
        // Get current session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          throw sessionError
        }
        
        if (sessionData?.session) {
          // Set user from session
          setUser(sessionData.session.user)
          
          // Fetch user profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*, roles(*)')
            .eq('id', sessionData.session.user.id)
            .single()
          
          if (profileError) {
            console.error('Error fetching profile:', profileError)
          } else {
            setProfile(profileData)
          }
        }
      } catch (err: any) {
        console.error('Auth error:', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user)
          
          // Fetch user profile when signed in
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*, roles(*)')
            .eq('id', session.user.id)
            .single()
          
          if (profileError) {
            console.error('Error fetching profile:', profileError)
          } else {
            setProfile(profileData)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
        }
      }
    )

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      
      if (data.session) {
        setUser(data.session.user)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*, roles(*)')
          .eq('id', data.session.user.id)
          .single()
        
        if (profileError) {
          console.error('Error fetching profile:', profileError)
        } else {
          setProfile(profileData)
        }
        
        navigate('/dashboard')
      }
    } catch (err: any) {
      console.error('Sign in error:', err)
      setError(err)
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: err.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (error) throw error
      
      // For now, we'll let the auth hook handle setting the user
      toast({
        title: "Account created",
        description: "Please check your email to confirm your account",
      })
    } catch (err: any) {
      console.error('Sign up error:', err)
      setError(err)
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: err.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setProfile(null)
      navigate('/')
    } catch (err: any) {
      console.error('Sign out error:', err)
      setError(err)
    }
  }
  
  const resetPassword = async (email: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      
      if (error) throw error
      
      toast({
        title: "Password reset email sent",
        description: "Please check your email for a password reset link",
      })
    } catch (err: any) {
      console.error('Reset password error:', err)
      setError(err)
      toast({
        variant: "destructive",
        title: "Password reset failed",
        description: err.message,
      })
    } finally {
      setLoading(false)
    }
  }
  
  const updatePassword = async (password: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.updateUser({
        password,
      })
      
      if (error) throw error
      
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated",
      })
      
      navigate('/dashboard')
    } catch (err: any) {
      console.error('Update password error:', err)
      setError(err)
      toast({
        variant: "destructive",
        title: "Password update failed",
        description: err.message,
      })
    } finally {
      setLoading(false)
    }
  }
  
  const setAuthError = (err: Error | null) => {
    setError(err)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        error,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        setAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
