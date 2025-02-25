
import { useParams } from "react-router-dom"
import { useRolePermissions } from "@/components/users/roles/hooks/useRolePermissions"
import { PermissionSection } from "@/components/users/roles/components/PermissionSection"
import { groupPermissions } from "@/components/users/roles/types/permissions"
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"
import { Skeleton } from "@/components/ui/skeleton"

export default function RolePermissions() {
  const { id } = useParams<{ id: string }>()
  const { permissions, isLoading, handlePermissionToggle, role } = useRolePermissions(id || null)

  console.log("Role ID:", id)
  console.log("Permissions:", permissions)
  console.log("Role:", role)

  if (isLoading) {
    return (
      <div className="space-y-8 p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-2">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-16 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!permissions || permissions.length === 0) {
    return (
      <div className="space-y-8 p-6">
        <div className="space-y-4">
          <PageBreadcrumbs />
          <h1 className="text-3xl font-bold">Role Permissions</h1>
          <p className="text-muted-foreground">
            No permissions found for this role. Please ensure the role exists and has permissions configured.
          </p>
        </div>
      </div>
    )
  }

  const groupedPermissions = groupPermissions(permissions)

  return (
    <div className="space-y-8 p-6">
      <div className="space-y-4">
        <PageBreadcrumbs />
        <h1 className="text-3xl font-bold">Role Permissions</h1>
        {role && (
          <p className="text-muted-foreground">
            Manage permissions for the {role.nicename || role.name} role
          </p>
        )}
      </div>
      <div className="space-y-12">
        {Object.entries(groupedPermissions).map(([section, perms]) => (
          <PermissionSection
            key={section}
            sectionName={section.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            permissions={perms}
            onToggle={handlePermissionToggle}
            isDisabled={isLoading}
          />
        ))}
      </div>
    </div>
  )
}
