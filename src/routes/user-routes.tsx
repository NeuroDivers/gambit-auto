
import UserManagement from "@/pages/admin/UserManagement"
import SystemRoles from "@/pages/admin/SystemRoles"
import RolePermissions from "@/pages/admin/RolePermissions"
import { RouteObject } from "react-router-dom"

export const userRoutes: RouteObject[] = [
  {
    path: "user-management",
    element: <UserManagement />,
  },
  {
    path: "system-roles",
    element: <SystemRoles />,
  },
  {
    path: "system-roles/:roleId/permissions",
    element: <RolePermissions />,
  },
]
