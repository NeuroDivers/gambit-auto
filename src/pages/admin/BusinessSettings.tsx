
import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Building2, Loader2 } from "lucide-react"
import { useBusinessProfile } from "@/features/business/hooks/useBusinessProfile"
import { BusinessForm } from "@/features/business/components/BusinessForm"

export default function BusinessSettings() {
  const { data: businessProfile, isLoading, error } = useBusinessProfile()

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-2xl mx-auto border-destructive">
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#9b87f5]" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl flex items-center gap-2 text-[#7E69AB]">
            <Building2 className="h-6 w-6" />
            Business Settings
          </CardTitle>
          <CardDescription>
            Manage your business profile and contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BusinessForm businessProfile={businessProfile} />
        </CardContent>
      </Card>
    </div>
  )
}
