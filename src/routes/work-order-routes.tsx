
import { RouteObject } from "react-router-dom"
import { PermissionGuard } from "@/components/auth/PermissionGuard"
import WorkOrders from "@/pages/admin/WorkOrders"
import StaffWorkOrders from "@/pages/staff/StaffWorkOrders"
import StaffCalendar from "@/pages/staff/StaffCalendar"
import CreateWorkOrder from "@/pages/admin/CreateWorkOrder"
import EditWorkOrder from "@/pages/admin/EditWorkOrder"
import Calendar from "@/pages/admin/Calendar"
import { ErrorBoundary } from "@/components/shared/ErrorBoundary"
import { usePermissions } from "@/hooks/usePermissions"

const RoleBasedWorkOrders = () => {
  const { currentUserRole } = usePermissions();
  const role = currentUserRole?.name?.toLowerCase();
  
  if (role === 'staff' || role === 'technician') {
    return <StaffWorkOrders />;
  }
  
  return <WorkOrders />;
};

const RoleBasedCalendar = () => {
  const { currentUserRole } = usePermissions();
  const role = currentUserRole?.name?.toLowerCase();
  
  if (role === 'staff' || role === 'technician') {
    return <StaffCalendar />;
  }
  
  return <Calendar />;
};

export const workOrderRoutes: RouteObject[] = [
  {
    path: "work-orders",
    element: (
      <PermissionGuard resource="work_orders" type="page_access">
        <ErrorBoundary />
      </PermissionGuard>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <RoleBasedWorkOrders />
      }
    ]
  },
  {
    path: "work-orders/create",
    element: (
      <PermissionGuard resource="work_orders" type="page_access">
        <ErrorBoundary />
      </PermissionGuard>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <CreateWorkOrder />
      }
    ]
  },
  {
    path: "work-orders/:id/edit",
    element: (
      <PermissionGuard resource="work_orders" type="page_access">
        <ErrorBoundary />
      </PermissionGuard>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <EditWorkOrder />
      }
    ]
  },
  {
    path: "calendar",
    element: (
      <PermissionGuard resource="calendar" type="page_access">
        <ErrorBoundary />
      </PermissionGuard>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <RoleBasedCalendar />
      }
    ]
  },
];
