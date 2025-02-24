
import { StaffLayoutWrapper } from "@/components/staff/StaffLayoutWrapper"
import Dashboard from "@/pages/staff/Dashboard"
import ProfileSettings from "@/pages/admin/ProfileSettings"
import { RouteObject } from "react-router-dom"

export const staffRoutes: RouteObject = {
  path: "/staff",
  element: <StaffLayoutWrapper />,
  children: [
    {
      path: "",
      element: <Dashboard />,
    },
    {
      path: "profile-settings",
      element: <ProfileSettings />,
    },
  ]
}
