
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (error) {
        console.error("Error fetching profile:", error)
        throw error
      }
      return data
    },
    enabled: !!currentUserRole
  })

  console.log("Dashboard rendering. Role:", currentUserRole, "Profile:", profile)

  if (roleLoading || profileLoading) {
    return <LoadingScreen />
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
