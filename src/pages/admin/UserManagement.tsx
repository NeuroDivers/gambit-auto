
import { useState, useEffect } from "react"
import { usePermissions } from "@/hooks/usePermissions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Users, ShieldAlert } from "lucide-react"
import { UserManagementSection } from "@/components/users/UserManagementSection"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function UserManagement() {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const { checkPermission } = usePermissions()

  useEffect(() => {
    const checkAccess = async () => {
      const hasPermission = await checkPermission("users", "page_access")
      console.log("Users permission check:", hasPermission)
      setHasAccess(hasPermission)
    }
    checkAccess()
  }, [checkPermission])

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
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Access Denied</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p>You don't have permission to access user management.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">
              Manage users and their roles in the system
            </p>
          </div>
        </div>
        <Alert>
          <Users className="h-4 w-4" />
          <AlertTitle>User Roles</AlertTitle>
          <AlertDescription>
            Each user can be assigned a role that determines their access and permissions within the system.
            Make sure to configure role permissions appropriately.
          </AlertDescription>
        </Alert>
      </div>
      <UserManagementSection />
    </div>
  )
}
