
import { RouteObject } from "react-router-dom"
import { PermissionGuard } from "@/components/auth/PermissionGuard"
import ClientManagement from "@/pages/admin/ClientManagement"
import ClientDetails from "@/pages/admin/ClientDetails"

export const clientRoutes: RouteObject[] = [
  {
    path: "clients",
    element: (
      <PermissionGuard resource="clients" type="page_access">
        <ClientManagement />
      </PermissionGuard>
    ),
  },
  {
    path: "clients/:id",
    element: (
      <PermissionGuard resource="clients" type="page_access">
        <ClientDetails />
      </PermissionGuard>
    ),
  },
]
