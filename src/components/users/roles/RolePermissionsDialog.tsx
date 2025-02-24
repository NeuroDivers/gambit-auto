
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRolePermissions } from "./hooks/useRolePermissions"
import { PermissionSection } from "./components/PermissionSection"
import { groupPermissions } from "./types/permissions"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Users, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface RolePermissionsDialogProps {
  roleId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const RolePermissionsDialog = ({
  roleId,
  open,
  onOpenChange,
}: RolePermissionsDialogProps) => {
  const {
    permissions,
    isLoading,
    isUpdating,
    role,
    handlePermissionToggle,
    handleAssignmentToggle,
  } = useRolePermissions(roleId)

  if (isLoading) {
    return null
  }

  const groupedPermissions = permissions ? groupPermissions(permissions) : {}

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1200px]">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-2">
            <DialogTitle>Manage Role Permissions</DialogTitle>
            {role && (
              <Badge variant="secondary" className="gap-1">
                <Users className="h-3 w-3" />
                {role.nicename || role.name}
              </Badge>
            )}
          </div>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Setting permissions defines what users with this role can access and do in the system.
            </AlertDescription>
          </Alert>
        </DialogHeader>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-8">
            {/* Assignment Permissions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4 text-primary">
                Assignment Settings
              </h3>
              <div className="grid gap-4">
                <div className="flex items-center justify-between space-x-4 p-4 rounded-lg bg-muted/50">
                  <div className="space-y-0.5">
                    <Label>Bay Assignment</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow this role to be assigned to service bays
                    </p>
                  </div>
                  <Switch
                    checked={role?.can_be_assigned_to_bay || false}
                    onCheckedChange={(checked) => handleAssignmentToggle('bay', checked)}
                    disabled={isUpdating}
                  />
                </div>
                <div className="flex items-center justify-between space-x-4 p-4 rounded-lg bg-muted/50">
                  <div className="space-y-0.5">
                    <Label>Work Order Assignment</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow this role to be assigned work orders
                    </p>
                  </div>
                  <Switch
                    checked={role?.can_be_assigned_work_orders || false}
                    onCheckedChange={(checked) => handleAssignmentToggle('work_orders', checked)}
                    disabled={isUpdating}
                  />
                </div>
              </div>
            </div>

            {/* Page Access Permissions */}
            {groupedPermissions['page_access'] && (
              <PermissionSection
                key="page_access"
                sectionName="Page Access"
                permissions={groupedPermissions['page_access']}
                onToggle={handlePermissionToggle}
                isDisabled={isUpdating}
              />
            )}

            {/* Feature Access Permissions */}
            {groupedPermissions['feature_access'] && (
              <PermissionSection
                key="feature_access"
                sectionName="Feature Access"
                permissions={groupedPermissions['feature_access']}
                onToggle={handlePermissionToggle}
                isDisabled={isUpdating}
              />
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
