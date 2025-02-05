import { ProfileForm } from "@/components/profile/ProfileForm"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export default function ProfileSettings() {
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No user found")
      
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
      
      return data
    },
  })

  return (
    <DashboardLayout
      firstName={profile?.first_name}
      role={profile?.role}
      onLogout={async () => {
        await supabase.auth.signOut()
        window.location.href = "/auth"
      }}
    >
      <div className="container py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your personal profile information.
          </p>
        </div>

        <div className="max-w-2xl">
          <ProfileForm />
        </div>
      </div>
    </DashboardLayout>
  )
}