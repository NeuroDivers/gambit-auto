
import { usePermissions } from "@/hooks/usePermissions"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { LoadingScreen } from "@/components/shared/LoadingScreen"
import { AdminDashboard } from "./templates/AdminDashboard"
import { StaffDashboard } from "./templates/StaffDashboard"
import { ClientDashboard } from "./templates/ClientDashboard"

export default function Dashboard() {
  const { currentUserRole, isLoading: roleLoading } = usePermissions()

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          console.error("No user found in auth.getUser")
          return null
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (error) {
          console.error("Error fetching profile:", error)
          throw error
        }
        
        console.log("Profile data fetched:", data)
        return data
      } catch (e) {
        console.error("Error in profile query:", e)
        throw e
      }
    },
    enabled: !!currentUserRole,
    retry: 3,
    retryDelay: 1000
  })

  console.log("Dashboard rendering. Role:", currentUserRole, "Profile:", profile)

  if (roleLoading || profileLoading) {
    return <LoadingScreen />
  }

  if (!currentUserRole) {
    console.error("No user role found")
    return <div className="p-6">Error: Unable to determine user role. Please try logging out and back in.</div>
  }

  if (!profile) {
    console.error("No profile found")
    return <div className="p-6">Error: Unable to load user profile. Please try refreshing the page.</div>
  }

  // Determine which dashboard to show based on role's default_dashboard
  if (currentUserRole?.default_dashboard === 'admin') {
    return <AdminDashboard profile={profile} />
  }

  if (currentUserRole?.default_dashboard === 'staff') {
    return <StaffDashboard profile={profile} />
  }

  // Default to client dashboard
  return <ClientDashboard profile={profile} />
}
