
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"
import { useRolePermissions } from "./hooks/useRolePermissions"
import { PermissionSection } from "./components/PermissionSection"
import { groupPermissions } from "./types/permissions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Role } from "./types/role"
import { Label } from "@/components/ui/label"

interface RolePermissionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: Role
}

export const RolePermissionsDialog = ({ open, onOpenChange, role }: RolePermissionsDialogProps) => {
  const {
    permissions,
    isLoading,
    isUpdating,
    handlePermissionToggle,
    handleDashboardChange
  } = useRolePermissions(role?.id || null)

  if (isLoading) {
    return null
  }

  const groupedPermissions = permissions ? groupPermissions(permissions) : {}

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>Role Permissions</DialogTitle>
            <Badge variant="secondary" className="gap-1">
              <Users className="h-3 w-3" />
              {role.nicename || role.name}
            </Badge>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto mt-4">
          <div className="space-y-8">
            {/* Role Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">
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
                  value={role?.default_dashboard || "client"}
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

            {/* Page Access Permissions */}
            {groupedPermissions['page_access'] && (
              <PermissionSection
                sectionName="Page Access"
                permissions={groupedPermissions['page_access']}
                onToggle={handlePermissionToggle}
                isDisabled={isUpdating}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
