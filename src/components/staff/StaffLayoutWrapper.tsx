
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

  const { data: hasAccess, isLoading: permissionLoading } = useQuery({
    queryKey: ["staff-dashboard-access", session?.user.id],
    enabled: !!session?.user.id,
    queryFn: async () => {
      const { data } = await supabase.rpc('has_permission', {
        user_id: session!.user.id,
        resource: 'staff_dashboard',
        perm_type: 'page_access'
      })
      return data
    }
  })

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", session?.user?.id],
    enabled: !!session?.user?.id && !!hasAccess,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          role:role_id (
            id,
            name,
            nicename
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

  if (sessionLoading || permissionLoading || profileLoading) {
    return <LoadingScreen />
  }

  if (!session) {
    return <Navigate to="/auth" replace />
  }

  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />
  }

  if (!profile) {
    return <LoadingScreen />
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
