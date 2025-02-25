
import { DashboardLayoutWrapper } from "@/components/dashboard/DashboardLayoutWrapper"
import Dashboard from "@/pages/dashboard/Dashboard"
import { RouteObject } from "react-router-dom"
import { workOrderRoutes } from "./work-order-routes"
import { serviceRoutes } from "./service-routes"
import { userRoutes } from "./user-routes"
import { estimateRoutes } from "./estimate-routes"
import { invoiceRoutes } from "./invoice-routes"
import { clientRoutes } from "./client-routes"
import { settingsRoutes } from "./settings-routes"

export const protectedRoutes: RouteObject = {
  path: "/",
  element: <DashboardLayoutWrapper />,
  children: [
    {
      path: "",
      element: <Dashboard />,
      index: true
    },
    {
      path: "dashboard",
      element: <Dashboard />,
    },
    ...workOrderRoutes,
    ...serviceRoutes,
    ...userRoutes,
    ...estimateRoutes,
    ...invoiceRoutes,
    ...clientRoutes,
    ...settingsRoutes,
  ],
}
