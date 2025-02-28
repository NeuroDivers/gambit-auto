
import { RouteObject } from "react-router-dom"
import ServiceTypes from "@/pages/admin/ServiceTypes"
import ServiceBays from "@/pages/admin/ServiceBays"
import { PermissionGuard } from "@/components/auth/PermissionGuard"

export const serviceRoutes: RouteObject[] = [
  {
    path: "service-types",
    element: (
      <PermissionGuard requiredPermission={{ resource: "service_types", type: "page_access" }}>
        <ServiceTypes />
      </PermissionGuard>
    ),
  },
  {
    path: "service-bays",
    element: (
      <PermissionGuard requiredPermission={{ resource: "service_bays", type: "page_access" }}>
        <ServiceBays />
      </PermissionGuard>
    ),
  },
]
