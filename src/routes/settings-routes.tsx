
import { RouteObject } from "react-router-dom"
import { PermissionGuard } from "@/components/auth/PermissionGuard"
import BusinessSettings from "@/pages/admin/BusinessSettings"
import ProfileSettings from "@/pages/admin/ProfileSettings"
import DeveloperSettings from "@/pages/admin/DeveloperSettings"
import { Navigate } from "react-router-dom"

export const settingsRoutes: RouteObject[] = [
  {
    path: "settings",
    element: <Navigate to="/profile-settings" replace />,
  },
  {
    path: "business-settings",
    element: (
      <PermissionGuard resource="business_settings" type="page_access">
        <BusinessSettings />
      </PermissionGuard>
    ),
  },
  {
    path: "profile-settings",
    element: <ProfileSettings />,
  },
  {
    path: "developer-settings",
    element: (
      <PermissionGuard resource="developer_settings" type="page_access">
        <DeveloperSettings />
      </PermissionGuard>
    ),
  },
]
