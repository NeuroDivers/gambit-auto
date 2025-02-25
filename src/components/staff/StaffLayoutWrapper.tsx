
import React from "react"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useQuery } from "@tanstack/react-query"
import { Outlet, Navigate } from "react-router-dom"
import { StaffLayout } from "./StaffLayout"
import { LoadingScreen } from "../shared/LoadingScreen"

export function StaffLayoutWrapper() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      if (!session) throw new Error("No session found")
      return session
    },
  })

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          role:role_id (
            id,
            name,
            nicename,
            default_dashboard
          )
        `)
        .eq("id", session!.user.id)
        .single()

      if (error) throw error
      return data
    },
  })

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      navigate("/auth", { replace: true })
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      })
    } catch (error: any) {
      console.error("Logout error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to log out",
      })
    }
  }

  if (sessionLoading || profileLoading) {
    return <LoadingScreen />
  }

  if (!session) {
    return <Navigate to="/auth" replace />
  }

  // Allow access if user has staff dashboard or is an admin
  if (!profile?.role?.default_dashboard || 
      (profile.role.default_dashboard !== 'staff' && 
       profile.role.default_dashboard !== 'admin')) {
    console.log('User does not have staff access, redirecting to unauthorized')
    return <Navigate to="/unauthorized" replace />
  }

  return (
    <StaffLayout
      firstName={profile.first_name}
      role={profile.role}
      onLogout={handleLogout}
    >
      <Outlet />
    </StaffLayout>
  )
}
