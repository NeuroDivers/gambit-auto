
import { RouteObject } from "react-router-dom"
import { PermissionGuard } from "@/components/auth/PermissionGuard"
import ClientVehicles from "@/pages/client/Vehicles"
import { ErrorBoundary } from "@/components/shared/ErrorBoundary"

export const vehicleRoutes: RouteObject[] = [
  {
    path: "vehicles",
    element: (
      <PermissionGuard resource="vehicles" type="page_access">
        <ClientVehicles />
      </PermissionGuard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "customers/:customerId/vehicles",
    element: (
      <PermissionGuard resource="customers" type="page_access">
        <ClientVehicles />
      </PermissionGuard>
    ),
    errorElement: <ErrorBoundary />,
  }
]
