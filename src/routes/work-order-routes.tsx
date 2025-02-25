
import { RouteObject } from "react-router-dom"
import { PermissionGuard } from "@/components/auth/PermissionGuard"
import WorkOrders from "@/pages/admin/WorkOrders"
import CreateWorkOrder from "@/pages/admin/CreateWorkOrder"
import EditWorkOrder from "@/pages/admin/EditWorkOrder"

export const workOrderRoutes: RouteObject[] = [
  {
    path: "work-orders",
    element: (
      <PermissionGuard resource="work_orders" type="page_access">
        <WorkOrders />
      </PermissionGuard>
    ),
  },
  {
    path: "work-orders/create",
    element: (
      <PermissionGuard resource="work_orders" type="page_access">
        <CreateWorkOrder />
      </PermissionGuard>
    ),
  },
  {
    path: "work-orders/:id/edit",
    element: (
      <PermissionGuard resource="work_orders" type="page_access">
        <EditWorkOrder />
      </PermissionGuard>
    ),
  },
  {
    path: "calendar",
    element: (
      <PermissionGuard resource="work_orders" type="page_access">
        <WorkOrders />
      </PermissionGuard>
    ),
  },
]
