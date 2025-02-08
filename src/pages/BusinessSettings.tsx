
import { BusinessProfileForm } from "@/components/business/BusinessProfileForm"
import { BusinessTaxForm } from "@/components/business/BusinessTaxForm"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"

export default function BusinessSettings() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto py-12">
        <div className="px-6">
          <div className="mb-8">
            <PageBreadcrumbs />
            <h1 className="text-3xl font-bold">Business Settings</h1>
            <p className="text-muted-foreground">
              Manage your business profile and tax information.
            </p>
          </div>
        </div>
        <div className="max-w-[1600px] mx-auto">
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
      </div>
    </div>
  )
}
