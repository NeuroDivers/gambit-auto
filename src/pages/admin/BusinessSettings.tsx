
import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Building2, ReceiptText, Loader2 } from "lucide-react"
import { useBusinessProfile } from "@/features/business/hooks/useBusinessProfile"
import { BusinessForm } from "@/features/business/components/BusinessForm"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { TaxManagementForm } from "@/features/business/components/TaxManagementForm"
import { PageTitle } from "@/components/shared/PageTitle"

export default function BusinessSettings() {
  const { data: businessProfile, isLoading: profileLoading, error: profileError } = useBusinessProfile()
  
  const { data: taxes, isLoading: taxesLoading, error: taxError } = useQuery({
    queryKey: ['business-taxes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_taxes')
        .select('*')
      
      if (error) throw error
      return data
    }
  })

  if (profileError || taxError) {
    const error = profileError || taxError;
    return (
      <div className="p-6">
        <PageTitle 
          title="Business Settings" 
          description="Manage your business profile and settings"
        />
        <Card className="mt-6 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">
              {error instanceof Error 
                ? error.message 
                : "Failed to load business settings. Please try again later."}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (profileLoading || taxesLoading) {
    return (
      <div className="p-6">
        <PageTitle 
          title="Business Settings" 
          description="Manage your business profile and settings"
        />
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <PageTitle 
        title="Business Settings" 
        description="Manage your business profile and settings"
      />

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full sm:w-auto inline-flex">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Business Profile
          </TabsTrigger>
          <TabsTrigger value="taxes" className="flex items-center gap-2">
            <ReceiptText className="h-4 w-4" />
            Tax Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                Business Profile
              </CardTitle>
              <CardDescription>
                Update your business information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BusinessForm businessProfile={businessProfile} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="taxes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <ReceiptText className="h-5 w-5 text-muted-foreground" />
                Tax Settings
              </CardTitle>
              <CardDescription>
                Configure your business tax rates and registration numbers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TaxManagementForm initialTaxes={taxes || []} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
