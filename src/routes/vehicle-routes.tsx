
import { RouteObject } from "react-router-dom"
import { PermissionGuard } from "@/components/auth/PermissionGuard"
import ClientVehicles from "@/pages/client/Vehicles"

export const vehicleRoutes: RouteObject[] = [
  {
    path: "vehicles",
    element: (
      <PermissionGuard resource="vehicles" type="page_access">
        <ClientVehicles />
      </PermissionGuard>
    ),
  },
]
