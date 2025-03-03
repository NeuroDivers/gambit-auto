
import UserManagement from "@/pages/admin/UserManagement"
import SystemRoles from "@/pages/admin/SystemRoles"
import RolePermissions from "@/pages/admin/RolePermissions"
import UserDetails from "@/pages/UserDetails"
import { RouteObject } from "react-router-dom"

export const userRoutes: RouteObject[] = [
  {
    path: "staff-management",
    element: <UserManagement />,
  },
  {
    path: "system-roles",
    element: <SystemRoles />,
  },
  {
    path: "system-roles/:id/permissions",
    element: <RolePermissions />,
  },
  {
    path: "staff/:id",
    element: <UserDetails />,
  },
]
