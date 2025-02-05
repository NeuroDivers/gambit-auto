import { ProfileForm } from "@/components/profile/ProfileForm"
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export default function ProfileSettings() {
  const { data: userRole } = useQuery({
    queryKey: ["userRole"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      return roleData?.role
    }
  })

  return (
    <div className="container py-6 space-y-6">
      <PageBreadcrumbs />
      
      <div>
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your personal profile information.
        </p>
      </div>

      <div className="max-w-2xl">
        <ProfileForm role={userRole} />
      </div>
    </div>
  )
}