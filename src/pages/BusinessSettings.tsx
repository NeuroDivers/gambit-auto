import { BusinessProfileForm } from "@/components/business/BusinessProfileForm"
import { BusinessTaxForm } from "@/components/business/BusinessTaxForm"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAdminStatus } from "@/hooks/useAdminStatus"
import { Navigate } from "react-router-dom"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export default function BusinessSettings() {
  const { isAdmin } = useAdminStatus()

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

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return (
    <DashboardLayout
      firstName={profile?.first_name}
      role="admin"
      onLogout={async () => {
        await supabase.auth.signOut()
        window.location.href = "/auth"
      }}
    >
      <div className="container py-6 space-y-6">
        <PageBreadcrumbs />
        
        <div>
          <h1 className="text-2xl font-bold">Business Settings</h1>
          <p className="text-muted-foreground">
            Manage your business profile and tax information.
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Business Profile</TabsTrigger>
            <TabsTrigger value="taxes">Tax Information</TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="mt-6">
            <BusinessProfileForm />
          </TabsContent>
          <TabsContent value="taxes" className="mt-6">
            <BusinessTaxForm />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}