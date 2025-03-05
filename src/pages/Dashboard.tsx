
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { AdminDashboard } from "@/pages/dashboard/templates/AdminDashboard"
import { StaffDashboard } from "@/pages/dashboard/templates/StaffDashboard"
import { ClientDashboard } from "@/pages/dashboard/templates/ClientDashboard"
import { usePermissions } from "@/hooks/usePermissions"
import { LoadingScreen } from "@/components/shared/LoadingScreen"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

export default function Dashboard() {
  const { currentUserRole, isLoading: permissionsLoading } = usePermissions()
  const { session } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<Error | null>(null)

  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("No user found")
        
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle()
        
        if (error) throw error
        return profileData
      } catch (err) {
        console.error("Error fetching profile:", err)
        setError(err instanceof Error ? err : new Error(String(err)))
        return null
      }
    },
    enabled: !!session,
    retry: 1
  })

  useEffect(() => {
    // If we have a role with a default dashboard, redirect to it
    if (currentUserRole?.default_dashboard && !permissionsLoading) {
      const dashboardPath = `/${currentUserRole.default_dashboard}`
      console.log(`Redirecting to default dashboard: ${dashboardPath}`)
      navigate(dashboardPath, { replace: true })
    }
  }, [currentUserRole, permissionsLoading, navigate])

  if (profileError) {
    console.error("Profile query error:", profileError)
    return <div className="p-4">Error loading profile data. Please refresh the page.</div>
  }

  if (error) {
    console.error("Dashboard error:", error)
    return <div className="p-4">Error loading dashboard. Please refresh the page.</div>
  }

  if (permissionsLoading || profileLoading) {
    return <LoadingScreen />
  }

  // Determine which dashboard template to show based on user role
  if (currentUserRole?.name?.toLowerCase() === 'administrator') {
    return <AdminDashboard profile={profile} />
  }

  if (currentUserRole?.name?.toLowerCase() === 'staff') {
    return <StaffDashboard profile={profile} />
  }

  return <ClientDashboard profile={profile} />
}
