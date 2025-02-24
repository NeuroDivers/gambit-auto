
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { AdminDashboard } from "./templates/AdminDashboard"
import { StaffDashboard } from "./templates/StaffDashboard"
import { ClientDashboard } from "./templates/ClientDashboard"
import { usePermissions } from "@/hooks/usePermissions"
import { LoadingScreen } from "@/components/shared/LoadingScreen"

export default function Dashboard() {
  const { currentUserRole } = usePermissions()

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No user found")
      
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle()
      
      return profileData
    },
  })

  if (profileLoading) {
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
