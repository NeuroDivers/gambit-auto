
import { useEffect, useState, createContext, useContext } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { AuthError } from '@supabase/supabase-js'

type Profile = {
  id: string
  first_name: string
  last_name: string
  avatar_url?: string
  role?: {
    id: string
    name: string
    nicename: string
  }
}

type AuthContextType = {
  user: any
  profile: Profile | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signup: (email: string, password: string) => Promise<{ error: AuthError | null }>
  logout: () => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }> // Alias for logout
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      }
      
      setLoading(false)
      
      // Listen for auth changes
      const { data: { subscription } } = await supabase.auth.onAuthStateChange(
        async (event, session) => {
          setUser(session?.user || null)
          
          if (session?.user) {
            await fetchUserProfile(session.user.id)
          } else {
            setProfile(null)
          }
          
          setLoading(false)
        }
      )
      
      return () => {
        subscription.unsubscribe()
      }
    }
    
    initializeAuth()
  }, [])
  
  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        avatar_url,
        role:role_id (
          id,
          name,
          nicename
        )
      `)
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Error fetching profile:', error)
      return
    }
    
    setProfile(data)
  }
  
  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    return { error }
  }
  
  const signup = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    return { error }
  }
  
  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }
  
  // Add signOut as an alias for logout
  const signOut = logout
  
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
  
  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        signup,
        logout,
        signOut,  // Include the signOut alias
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
