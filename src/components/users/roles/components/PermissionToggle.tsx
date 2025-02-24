
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Permission } from "../types/permissions"

interface PermissionToggleProps {
  permission: Permission
  onToggle: (permission: Permission, newValue: boolean) => void
  isDisabled: boolean
}

export const PermissionToggle = ({
  permission,
  onToggle,
  isDisabled
}: PermissionToggleProps) => {
  const switchId = `permission-${permission.id}`
  
  const getPermissionType = (type: string) => {
    switch (type) {
      case 'page_access':
        return <Badge variant="outline">Page Access</Badge>
      case 'feature_access':
        return <Badge variant="outline">Feature Access</Badge>
      default:
        return null
    }
  }
  
  return (
    <div className="flex items-start justify-between space-x-4 p-4 rounded-lg bg-muted/50">
      <Label htmlFor={switchId} className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium">
            {permission.resource_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
          {getPermissionType(permission.permission_type)}
        </div>
        {permission.description && (
          <p className="text-sm text-muted-foreground">{permission.description}</p>
        )}
      </Label>
      <Switch
        id={switchId}
        name={switchId}
        checked={permission.is_active}
        onCheckedChange={(checked) => onToggle(permission, checked)}
        disabled={isDisabled}
        className="data-[state=checked]:bg-primary"
      />
    </div>
  )
}
