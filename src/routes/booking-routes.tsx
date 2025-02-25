
import { RouteObject } from "react-router-dom"
import { PermissionGuard } from "@/components/auth/PermissionGuard"
import Bookings from "@/pages/client/Bookings"

export const bookingRoutes: RouteObject[] = [
  {
    path: "bookings",
    element: (
      <PermissionGuard resource="bookings" type="page_access">
        <Bookings />
      </PermissionGuard>
    ),
  },
]
