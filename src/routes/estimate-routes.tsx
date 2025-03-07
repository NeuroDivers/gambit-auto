
import { RouteObject } from "react-router-dom"
import { PermissionGuard } from "@/components/auth/PermissionGuard"
import Estimates from "@/pages/admin/Estimates"
import CreateEstimate from "@/pages/admin/CreateEstimate"
import EstimateDetails from "@/pages/admin/EstimateDetails"
import EstimateRequestDetails from "@/pages/admin/EstimateRequestDetails"

export const estimateRoutes: RouteObject[] = [
  {
    path: "estimates/create",
    element: (
      <PermissionGuard resource="estimates" type="page_access">
        <CreateEstimate />
      </PermissionGuard>
    ),
  },
  {
    path: "estimates",
    element: (
      <PermissionGuard resource="estimates" type="page_access">
        <Estimates />
      </PermissionGuard>
    ),
  },
  {
    path: "estimates/requests/:id",
    element: (
      <PermissionGuard resource="estimates" type="page_access">
        <EstimateRequestDetails />
      </PermissionGuard>
    ),
  },
  {
    path: "estimates/:id",
    element: (
      <PermissionGuard resource="estimates" type="page_access">
        <EstimateDetails />
      </PermissionGuard>
    ),
  },
  {
    path: "edit-estimate/:id",
    element: (
      <PermissionGuard resource="estimates" type="page_access">
        <EstimateDetails />
      </PermissionGuard>
    ),
  },
]
