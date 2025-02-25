
import UserManagement from "@/pages/admin/UserManagement"
import UserDetails from "@/pages/UserDetails"
import RolePermissions from "@/pages/admin/RolePermissions"
import SystemRoles from "@/pages/admin/SystemRoles"
import StaffSkills from "@/pages/admin/StaffSkills"

export const userRoutes = [
  {
    path: "users",
    element: <UserManagement />,
  },
  {
    path: "users/:id",
    element: <UserDetails />,
  },
  {
    path: "system-roles",
    element: <SystemRoles />,
  },
  {
    path: "role-permissions/:id",
    element: <RolePermissions />,
  },
  {
    path: "admin/staff-skills",
    element: <StaffSkills />,
  }
]
