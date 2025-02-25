
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Permission } from "../types/permissions"

interface PermissionSectionProps {
  sectionName: string
  permissions: Permission[]
  onToggle: (permission: Permission, newValue: boolean) => void
  isDisabled: boolean
}

export const PermissionSection = ({
  sectionName,
  permissions,
  onToggle,
  isDisabled
}: PermissionSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary">
        {sectionName}
      </h3>
      <div className="grid gap-4">
        {permissions.map((permission) => (
          <div 
            key={permission.id}
            className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
          >
            <div className="space-y-0.5">
              <Label htmlFor={`permission-${permission.id}`}>
                {permission.resource_name.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </Label>
              {permission.description && (
                <p className="text-sm text-muted-foreground">
                  {permission.description}
                </p>
              )}
            </div>
            <Switch
              id={`permission-${permission.id}`}
              checked={permission.is_active}
              onCheckedChange={(checked) => onToggle(permission, checked)}
              disabled={isDisabled}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
