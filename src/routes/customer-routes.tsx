
import { RouteObject } from "react-router-dom"
import { PermissionGuard } from "@/components/auth/PermissionGuard"
import CustomerManagement from "@/pages/admin/CustomerManagement"
import CustomerDetails from "@/pages/admin/CustomerDetails"

export const customerRoutes: RouteObject[] = [
  {
    path: "customers",
    element: (
      <PermissionGuard resource="customers" type="page_access">
        <CustomerManagement />
      </PermissionGuard>
    ),
  },
  {
    path: "customers/:id",
    element: (
      <PermissionGuard resource="customers" type="page_access">
        <CustomerDetails />
      </PermissionGuard>
    ),
  },
  {
    path: "customers/:id/vehicles",
    element: (
      <PermissionGuard resource="vehicles" type="page_access">
        <CustomerDetails />
      </PermissionGuard>
    ),
  },
]
