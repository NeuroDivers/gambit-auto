
import { PermissionToggle } from "./PermissionToggle"
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {permissions.map((permission) => (
          <PermissionToggle
            key={permission.id}
            permission={permission}
            onToggle={onToggle}
            isDisabled={isDisabled}
          />
        ))}
      </div>
    </div>
  )
}
