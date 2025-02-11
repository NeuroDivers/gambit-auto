
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { QuoteRequestForm } from "@/components/client/quotes/QuoteRequestForm"

export default function ClientDashboard() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No user found")
      
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
      
      return profileData
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-primary/60 text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Add padding-bottom to account for mobile navigation */}
      <div className="container mx-auto py-6 px-4 md:py-12 md:px-6">
        <div className="space-y-6">
          <div className="mb-8">
            <PageBreadcrumbs />
            <h1 className="text-2xl md:text-3xl font-bold mt-4">Welcome back, {profile?.first_name}</h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">
              Manage your quotes, invoices, and bookings all in one place.
            </p>
          </div>

          <div className="w-full">
            <QuoteRequestForm />
          </div>
        </div>
      </div>
    </div>
  )
}

