
import { RouteObject } from "react-router-dom"
import { PermissionGuard } from "@/components/auth/PermissionGuard"
import UserManagement from "@/pages/admin/UserManagement"
import UserDetails from "@/pages/UserDetails"
import RolePermissions from "@/pages/admin/RolePermissions"
import SystemRoles from "@/pages/admin/SystemRoles"
import StaffSkills from "@/pages/admin/StaffSkills"

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
    path: "users/:id",
    element: (
      <PermissionGuard resource="users" type="page_access">
        <UserDetails />
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
    path: "role-permissions/:id",
    element: (
      <PermissionGuard resource="users" type="page_access">
        <RolePermissions />
      </PermissionGuard>
    ),
  },
  {
    path: "admin/staff-skills",
    element: (
      <PermissionGuard resource="staff_skills" type="page_access">
        <StaffSkills />
      </PermissionGuard>
    ),
  }
]
