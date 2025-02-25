
import { useNavigate, useParams } from "react-router-dom"
import { useRolePermissions } from "@/components/users/roles/hooks/useRolePermissions"
import { PermissionSection } from "@/components/users/roles/components/PermissionSection"
import { groupPermissions } from "@/components/users/roles/types/permissions"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Users, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export default function RolePermissions() {
  const navigate = useNavigate()
  const { roleId } = useParams()
  const {
    permissions,
    isLoading,
    isUpdating,
    role,
    handlePermissionToggle,
    handleDashboardChange,
    handleBayAssignmentToggle,
    handleWorkOrderAssignmentToggle
  } = useRolePermissions(roleId || null)

  console.log("RolePermissions page - roleId:", roleId)
  console.log("RolePermissions page - role:", role)
  console.log("RolePermissions page - permissions:", permissions)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!role) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Role not found or you don't have permission to access it.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const groupedPermissions = permissions ? groupPermissions(permissions) : {}

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/system-roles')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">Role Permissions</h1>
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" />
            {role.nicename || role.name}
          </Badge>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Setting permissions defines what users with this role can access and do in the system.
        </AlertDescription>
      </Alert>

      <div className="space-y-8">
        {/* Role Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-4 text-primary">
            Role Settings
          </h3>
          <div className="flex items-center justify-between space-x-4 p-4 rounded-lg bg-muted/50">
            <div className="space-y-0.5">
              <Label>Default Dashboard</Label>
              <p className="text-sm text-muted-foreground">
                Select which dashboard users with this role will see after logging in
              </p>
            </div>
            <Select
              value={role.default_dashboard || "client"}
              onValueChange={(value) => handleDashboardChange(value as "admin" | "staff" | "client")}
              disabled={isUpdating}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select dashboard" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin Dashboard</SelectItem>
                <SelectItem value="staff">Staff Dashboard</SelectItem>
                <SelectItem value="client">Client Dashboard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* System Role Permissions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">
            System Role Permissions
          </h3>
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="space-y-0.5">
                <Label>Bay Assignment</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users with this role to be assigned to service bays
                </p>
              </div>
              <Switch
                checked={role.can_be_assigned_to_bay}
                onCheckedChange={handleBayAssignmentToggle}
                disabled={isUpdating}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="space-y-0.5">
                <Label>Work Order Assignment</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users with this role to be assigned work orders
                </p>
              </div>
              <Switch
                checked={role.can_be_assigned_work_orders}
                onCheckedChange={handleWorkOrderAssignmentToggle}
                disabled={isUpdating}
              />
            </div>
          </div>
        </div>

        {/* Page Access Permissions */}
        {groupedPermissions['page_access'] && (
          <PermissionSection
            sectionName="Page Access"
            permissions={groupedPermissions['page_access']}
            onToggle={handlePermissionToggle}
            isDisabled={isUpdating}
          />
        )}

        {/* Feature Access Permissions */}
        {groupedPermissions['feature_access'] && (
          <PermissionSection
            sectionName="Feature Access"
            permissions={groupedPermissions['feature_access']}
            onToggle={handlePermissionToggle}
            isDisabled={isUpdating}
          />
        )}
      </div>
    </div>
  )
}
