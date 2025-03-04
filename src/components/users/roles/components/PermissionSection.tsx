
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Permission } from "../types/permissions"
import { Separator } from "@/components/ui/separator"
import { pageAccessGroups, featureAccessGroups } from "@/types/permissions"

interface PermissionSectionProps {
  sectionName: string
  permissions: Permission[]
  onToggle: (permission: Permission, newValue: boolean) => void
  isDisabled: boolean
}

interface GroupedPermissions {
  [key: string]: Permission[]
}

export const PermissionSection = ({
  sectionName,
  permissions,
  onToggle,
  isDisabled
}: PermissionSectionProps) => {
  // Group permissions by category
  const groupPermissionsByCategory = (permissions: Permission[]): GroupedPermissions => {
    const groups: GroupedPermissions = {}
    const groupDefinitions = sectionName === "Page Access" ? pageAccessGroups : featureAccessGroups
    
    // Initialize groups
    groupDefinitions.forEach(group => {
      groups[group.name] = []
    })
    
    // Add "Other" category for any permissions not in defined groups
    groups["Other"] = []
    
    // Sort permissions into groups
    permissions.forEach(permission => {
      let added = false
      for (const group of groupDefinitions) {
        if (group.resources.includes(permission.resource_name)) {
          groups[group.name].push(permission)
          added = true
          break
        }
      }
      
      if (!added) {
        groups["Other"].push(permission)
      }
    })
    
    // Remove empty groups
    Object.keys(groups).forEach(key => {
      if (groups[key].length === 0) {
        delete groups[key]
      }
    })
    
    return groups
  }
  
  const groupedPermissions = groupPermissionsByCategory(permissions)
  
  // Format resource name for display
  const formatResourceName = (resourceName: string): string => {
    return resourceName === "quotes" 
      ? "Estimates"
      : resourceName.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
  }
  
  // Format description for display
  const formatDescription = (description: string | null, resourceName: string): string | null => {
    if (!description) return null
    
    return resourceName === "quotes"
      ? description.replace(/quote/gi, "estimate").replace(/Quote/gi, "Estimate")
      : description
  }

  if (permissions.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">
          {sectionName}
        </h3>
        <p className="text-sm text-muted-foreground">No {sectionName.toLowerCase()} permissions found.</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-primary">
        {sectionName}
      </h3>
      
      {Object.entries(groupedPermissions).map(([groupName, groupPermissions]) => (
        <div key={groupName} className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-md">{groupName}</h4>
            <Separator />
          </div>
          
          <div className="grid gap-4">
            {groupPermissions.map((permission) => (
              <div 
                key={permission.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
              >
                <div className="space-y-0.5">
                  <Label htmlFor={`permission-${permission.id}`}>
                    {formatResourceName(permission.resource_name)}
                  </Label>
                  {permission.description && (
                    <p className="text-sm text-muted-foreground">
                      {formatDescription(permission.description, permission.resource_name)}
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
      ))}
    </div>
  )
}
