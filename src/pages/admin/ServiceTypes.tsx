
import { Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { ServiceTypeDialog } from "@/components/services/ServiceTypeDialog"
import { ServiceTypesList } from "@/components/services/ServiceTypesList"
import { toast } from "sonner"
import { usePermissions } from "@/hooks/usePermissions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarProvider, Sidebar, SidebarContent, SidebarInset, SidebarRail } from "@/components/ui/sidebar"

export default function ServiceTypes() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [typeFilter, setTypeFilter] = useState<string>("")
  const { checkPermission } = usePermissions()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAccess = async () => {
      const hasPermission = await checkPermission("service_types", "page_access")
      console.log("Service types permission check:", hasPermission)
      setHasAccess(hasPermission)
    }
    checkAccess()
  }, [checkPermission])

  const handleSuccess = () => {
    setIsDialogOpen(false)
    toast.success("Service type created successfully")
  }

  if (hasAccess === null) {
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
            <p>You don't have permission to access service types.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex w-full">
        <Sidebar collapsible="icon">
          <SidebarContent>
            {/* Sidebar content can be added here */}
          </SidebarContent>
          <SidebarRail />
        </Sidebar>
        <div className="flex-1">
          <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Service Types</h1>
            </div>

            <ServiceTypesList 
              onSearch={setSearchQuery}
              onStatusFilter={setStatusFilter}
              onTypeFilter={setTypeFilter}
            />
            
            <ServiceTypeDialog 
              open={isDialogOpen} 
              onOpenChange={setIsDialogOpen}
              onSuccess={handleSuccess}
            />
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
