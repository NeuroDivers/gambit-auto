
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
import { Loading } from "@/components/ui/loading"

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
        if (!user) {
          console.log("No user found, returning null")
          return null
        }
        
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle()
        
        if (error) {
          console.error("Profile query error:", error)
          return null
        }
        
        return profileData
      } catch (err) {
        console.error("Error fetching profile:", err)
        return null
      }
    },
    enabled: !!session,
    retry: 1
  })

  useEffect(() => {
    // Only redirect if we have a role with a default dashboard
    if (currentUserRole?.default_dashboard && !permissionsLoading) {
      const dashboardPath = `/${currentUserRole.default_dashboard}`
      console.log(`Redirecting to default dashboard: ${dashboardPath}`)
      navigate(dashboardPath, { replace: true })
    }
  }, [currentUserRole, permissionsLoading, navigate])

  // Show loading during initial data fetch
  if (permissionsLoading || profileLoading) {
    return <LoadingScreen />
  }

  // Handle error cases with simple UI instead of throwing
  if (profileError) {
    console.error("Profile query error:", profileError)
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-3">Error loading profile data</h2>
        <p className="mb-4">There was an issue loading your profile information. Please try refreshing the page.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Refresh Page
        </button>
      </div>
    )
  }

  if (error) {
    console.error("Dashboard error:", error)
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-3">Error loading dashboard</h2>
        <p className="mb-4">There was an unexpected error. Please try refreshing the page.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Refresh Page
        </button>
      </div>
    )
  }

  // If we don't have a profile yet but we're not in a loading state, show a simple message
  if (!profile && !profileLoading) {
    console.log("No profile data available, showing default dashboard")
    return <ClientDashboard profile={null} />
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
