
import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Building2, ReceiptText, Loader2 } from "lucide-react"
import { useBusinessProfile } from "@/features/business/hooks/useBusinessProfile"
import { BusinessForm } from "@/features/business/components/BusinessForm"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { TaxManagementForm } from "@/features/business/components/TaxManagementForm"

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
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-4xl mx-auto border-destructive">
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
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Business Profile
            </TabsTrigger>
            <TabsTrigger value="taxes" className="flex items-center gap-2">
              <ReceiptText className="h-4 w-4" />
              Tax Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card className="shadow-lg">
              <CardHeader className="space-y-2">
                <CardTitle className="text-2xl flex items-center gap-2 text-primary">
                  <Building2 className="h-6 w-6" />
                  Business Profile
                </CardTitle>
                <CardDescription>
                  Manage your business profile and contact information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BusinessForm businessProfile={businessProfile} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="taxes">
            <Card className="shadow-lg">
              <CardHeader className="space-y-2">
                <CardTitle className="text-2xl flex items-center gap-2 text-primary">
                  <ReceiptText className="h-6 w-6" />
                  Tax Settings
                </CardTitle>
                <CardDescription>
                  Configure your business tax rates and numbers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TaxManagementForm initialTaxes={taxes || []} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
