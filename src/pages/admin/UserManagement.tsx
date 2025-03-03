
import { useState, useEffect } from "react"
import { usePermissions } from "@/hooks/usePermissions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Users, ShieldAlert, Briefcase } from "lucide-react"
import { UserList } from "@/components/users/UserList"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CreateUserDialog } from "@/components/users/CreateUserDialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useAdminStatus } from "@/hooks/useAdminStatus"

export default function UserManagement() {
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("all");
  const { isAdmin } = useAdminStatus();
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
            <h1 className="text-3xl font-bold">Staff Management</h1>
            <p className="text-muted-foreground">
              Manage staff accounts including departments, positions and permissions
            </p>
          </div>
          {isAdmin && (
            <Button onClick={() => setIsCreateUserOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create User
            </Button>
          )}
        </div>
        
        <Alert>
          <Briefcase className="h-4 w-4" />
          <AlertTitle>Staff Management</AlertTitle>
          <AlertDescription>
            Manage staff accounts including departments, positions and permissions.
          </AlertDescription>
        </Alert>
        
        <UserList initialRoleFilter={selectedRole} useStaffView={true} excludeClients={true} />
      </div>
      
      <CreateUserDialog 
        open={isCreateUserOpen} 
        onOpenChange={setIsCreateUserOpen} 
      />
    </div>
  )
}
