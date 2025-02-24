
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import AdminDashboard from "./admin/Dashboard"
import StaffDashboard from "./staff/Dashboard"
import ClientDashboard from "./client/Dashboard"
import { LoadingScreen } from "@/components/shared/LoadingScreen"
import { Navigate } from "react-router-dom"

export default function Dashboard() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No user found")

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
        .eq("id", user.id)
        .single()

      if (error) throw error
      return data
    },
  })

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!profile?.role) {
    return <Navigate to="/auth" replace />
  }

  // Render the appropriate dashboard based on the user's role
  switch (profile.role.default_dashboard) {
    case "admin":
      return <AdminDashboard />
    case "staff":
      return <StaffDashboard />
    case "client":
    default:
      return <ClientDashboard />
  }
}
