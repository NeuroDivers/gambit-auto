
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
import { Suspense } from "react"
import { LoadingScreen } from "@/components/shared/LoadingScreen"

const RoleBasedWorkOrders = () => {
  const { currentUserRole } = usePermissions();
  const role = currentUserRole?.name?.toLowerCase();
  
  console.log("RoleBasedWorkOrders rendering with role:", role);
  
  if (role === 'staff' || role === 'technician') {
    return <StaffWorkOrders />;
  }
  
  return <WorkOrders />;
};

const RoleBasedCalendar = () => {
  const { currentUserRole } = usePermissions();
  const role = currentUserRole?.name?.toLowerCase();
  
  console.log("RoleBasedCalendar rendering with role:", role);
  
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
        <Suspense fallback={<LoadingScreen />}>
          <ErrorBoundary>
            <RoleBasedWorkOrders />
          </ErrorBoundary>
        </Suspense>
      </PermissionGuard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "work-orders/create",
    element: (
      <PermissionGuard resource="work_orders" type="page_access">
        <Suspense fallback={<LoadingScreen />}>
          <ErrorBoundary>
            <CreateWorkOrder />
          </ErrorBoundary>
        </Suspense>
      </PermissionGuard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "work-orders/:id/edit",
    element: (
      <PermissionGuard resource="work_orders" type="page_access">
        <Suspense fallback={<LoadingScreen />}>
          <ErrorBoundary>
            <EditWorkOrder />
          </ErrorBoundary>
        </Suspense>
      </PermissionGuard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "calendar",
    element: (
      <PermissionGuard resource="calendar" type="page_access">
        <Suspense fallback={<LoadingScreen />}>
          <ErrorBoundary>
            <RoleBasedCalendar />
          </ErrorBoundary>
        </Suspense>
      </PermissionGuard>
    ),
    errorElement: <ErrorBoundary />,
  },
];
