import { BusinessProfileForm } from "@/components/business/BusinessProfileForm"
import { BusinessTaxForm } from "@/components/business/BusinessTaxForm"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAdminStatus } from "@/hooks/useAdminStatus"
import { Navigate } from "react-router-dom"
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"

export default function BusinessSettings() {
  const { isAdmin, isLoading: isAdminLoading } = useAdminStatus()

  // Show loading state while checking admin status
  if (isAdminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return (
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
  )
}