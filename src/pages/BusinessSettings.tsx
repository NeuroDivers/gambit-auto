import { BusinessProfileForm } from "@/components/business/BusinessProfileForm"
import { BusinessTaxForm } from "@/components/business/BusinessTaxForm"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAdminStatus } from "@/hooks/useAdminStatus"
import { Navigate } from "react-router-dom"

export default function BusinessSettings() {
  const { isAdmin } = useAdminStatus()

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="container py-6 space-y-6">
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
        <TabsContent value="profile">
          <BusinessProfileForm />
        </TabsContent>
        <TabsContent value="taxes">
          <BusinessTaxForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}