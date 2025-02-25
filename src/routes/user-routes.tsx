
import { RouteObject } from "react-router-dom"
import { PermissionGuard } from "@/components/auth/PermissionGuard"
import UserManagement from "@/pages/admin/UserManagement"
import SystemRoles from "@/pages/admin/SystemRoles"
import RolePermissions from "@/pages/admin/RolePermissions"

export const userRoutes: RouteObject[] = [
  {
    path: "users",
    element: (
      <PermissionGuard resource="users" type="page_access">
        <UserManagement />
      </PermissionGuard>
    ),
  },
  {
    path: "system-roles",
    element: (
      <PermissionGuard resource="users" type="page_access">
        <SystemRoles />
      </PermissionGuard>
    ),
  },
  {
    path: "system-roles/:roleId/permissions",
    element: (
      <PermissionGuard resource="users" type="page_access">
        <RolePermissions />
      </PermissionGuard>
    ),
  },
]
