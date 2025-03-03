
import UserManagement from "@/pages/admin/UserManagement"
import SystemRoles from "@/pages/admin/SystemRoles"
import RolePermissions from "@/pages/admin/RolePermissions"
import StaffManagement from "@/pages/admin/StaffManagement"
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
    path: "system-roles/:id/permissions",
    element: <RolePermissions />,
  },
  {
    path: "staff-management",
    element: <StaffManagement />,
  },
]
