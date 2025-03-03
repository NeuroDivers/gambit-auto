
import { useState, useEffect } from "react"
import { usePermissions } from "@/hooks/usePermissions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Users2, ShieldAlert, PlusCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useAdminStatus } from "@/hooks/useAdminStatus"
import { StaffList } from "@/components/staff/StaffList"
import { CreateStaffDialog } from "@/components/staff/CreateStaffDialog"

export default function StaffManagement() {
  const [isCreateStaffOpen, setIsCreateStaffOpen] = useState(false)
  const { isAdmin } = useAdminStatus()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const { checkPermission } = usePermissions()

  useEffect(() => {
    const checkAccess = async () => {
      const hasPermission = await checkPermission("users", "page_access")
      console.log("Staff management permission check:", hasPermission)
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
            <p>You don't have permission to access staff management.</p>
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
              Manage staff information, roles, and settings
            </p>
          </div>
          {isAdmin && (
            <Button onClick={() => setIsCreateStaffOpen(true)} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Add Staff Member
            </Button>
          )}
        </div>
        <Alert>
          <Users2 className="h-4 w-4" />
          <AlertTitle>Staff Information</AlertTitle>
          <AlertDescription>
            View and manage staff details, positions, and departments. For user account management, please use the User Management section.
          </AlertDescription>
        </Alert>
      </div>
      <StaffList />
      <CreateStaffDialog 
        open={isCreateStaffOpen} 
        onOpenChange={setIsCreateStaffOpen} 
      />
    </div>
  )
}
