
import { RouteObject } from "react-router-dom"
import { PermissionGuard } from "@/components/auth/PermissionGuard"
import ServiceTypes from "@/pages/admin/ServiceTypes"
import ServiceBays from "@/pages/admin/ServiceBays"

export const serviceRoutes: RouteObject[] = [
  {
    path: "service-types",
    element: (
      <PermissionGuard resource="service_types" type="page_access">
        <ServiceTypes />
      </PermissionGuard>
    ),
  },
  {
    path: "service-bays",
    element: (
      <PermissionGuard resource="service_bays" type="page_access">
        <ServiceBays />
      </PermissionGuard>
    ),
  },
]
