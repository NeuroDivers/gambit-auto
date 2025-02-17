
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { usePermissions } from "@/hooks/usePermissions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

interface ServiceBay {
  id: string
  name: string
  status: 'available' | 'occupied' | 'maintenance'
  notes?: string
  assigned_profile_id?: string
  created_at: string
  updated_at: string
}

export default function ServiceBays() {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const { checkPermission } = usePermissions()

  // Check permission when component mounts
  useEffect(() => {
    const checkAccess = async () => {
      const hasPermission = await checkPermission("service_bays", "page_access")
      console.log("Service bays permission check:", hasPermission)
      setHasAccess(hasPermission)
    }
    checkAccess()
  }, [checkPermission])

  const { data: serviceBays, isLoading } = useQuery({
    queryKey: ["service-bays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_bays")
        .select("*")
        .order("name")

      if (error) throw error
      return data as ServiceBay[]
    },
  })

  if (hasAccess === null || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (hasAccess === false) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You don't have permission to access service bays.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Service Bays</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Service Bay
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {serviceBays?.map((bay) => (
          <Card key={bay.id}>
            <CardHeader>
              <CardTitle className="text-lg">{bay.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className={`text-sm font-medium capitalize ${
                    bay.status === 'available' ? 'text-green-500' :
                    bay.status === 'occupied' ? 'text-yellow-500' :
                    'text-red-500'
                  }`}>
                    {bay.status}
                  </span>
                </div>
                {bay.notes && (
                  <div className="text-sm text-muted-foreground">
                    {bay.notes}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
