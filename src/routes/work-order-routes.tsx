
import { RouteObject } from "react-router-dom"
import { PermissionGuard } from "@/components/auth/PermissionGuard"
import WorkOrders from "@/pages/admin/WorkOrders"
import StaffWorkOrders from "@/pages/staff/StaffWorkOrders"
import StaffCalendar from "@/pages/staff/StaffCalendar"
import CreateWorkOrder from "@/pages/admin/CreateWorkOrder"
import EditWorkOrder from "@/pages/admin/EditWorkOrder"
import Calendar from "@/pages/admin/Calendar"
import { usePermissions } from "@/hooks/usePermissions"

const RoleBasedWorkOrders = () => {
  const { currentUserRole } = usePermissions();
  const role = currentUserRole?.name?.toLowerCase();
  
  if (role === 'staff') {
    return <StaffWorkOrders />;
  }
  
  return <WorkOrders />;
};

const RoleBasedCalendar = () => {
  const { currentUserRole } = usePermissions();
  const role = currentUserRole?.name?.toLowerCase();
  
  if (role === 'staff') {
    return <StaffCalendar />;
  }
  
  return <Calendar />;
};

export const workOrderRoutes: RouteObject[] = [
  {
    path: "work-orders",
    element: (
      <PermissionGuard resource="work_orders" type="page_access">
        <RoleBasedWorkOrders />
      </PermissionGuard>
    ),
  },
  {
    path: "admin/work-orders/create",
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
      <PermissionGuard resource="calendar" type="page_access">
        <RoleBasedCalendar />
      </PermissionGuard>
    ),
  },
]
