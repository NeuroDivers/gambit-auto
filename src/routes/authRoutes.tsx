
import Auth from "@/pages/Auth"
import ResetPassword from "@/pages/ResetPassword"
import Unauthorized from "@/pages/Unauthorized"
import { RouteObject } from "react-router-dom"

export const authRoutes: RouteObject[] = [
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/auth/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  }
]
