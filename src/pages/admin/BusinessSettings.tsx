
import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useBusinessProfile } from "@/features/business/hooks/useBusinessProfile"
import { BusinessForm } from "@/features/business/components/BusinessForm"

export default function BusinessSettings() {
  const { data: businessProfile, isLoading, error } = useBusinessProfile()

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Business Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <BusinessForm businessProfile={businessProfile} />
        </CardContent>
      </Card>
    </div>
  )
}
