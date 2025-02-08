
import { ProfileForm } from "@/components/profile/ProfileForm"
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

interface RoleResponse {
  role: {
    name: string;
    nicename: string;
  }
}

export default function ProfileSettings() {
  const { data: userRole } = useQuery({
    queryKey: ["userRole"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data } = await supabase
        .from('profiles')
        .select(`
          role:role_id (
            name,
            nicename
          )
        `)
        .eq('id', user.id)
        .single()

      // Ensure we have the correct data structure before returning
      if (data?.role && typeof data.role === 'object' && 'name' in data.role) {
        return data.role.name
      }
      
      return null
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
