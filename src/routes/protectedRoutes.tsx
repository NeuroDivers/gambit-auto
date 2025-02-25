import { DashboardLayoutWrapper } from "@/components/dashboard/DashboardLayoutWrapper"
import { StaffLayoutWrapper } from "@/components/staff/StaffLayoutWrapper"
import { ClientLayoutWrapper } from "@/components/client/ClientLayoutWrapper"
import Dashboard from "@/pages/dashboard/Dashboard"
import { RouteObject } from "react-router-dom"
import { workOrderRoutes } from "./work-order-routes"
import { serviceRoutes } from "./service-routes"
import { userRoutes } from "./user-routes"
import { estimateRoutes } from "./estimate-routes"
import { invoiceRoutes } from "./invoice-routes"
import { clientRoutes } from "./client-routes"
import { settingsRoutes } from "./settings-routes"
import { usePermissions } from "@/hooks/usePermissions"
import { Navigate } from "react-router-dom"
import Chat from "@/pages/admin/Chat"
import Notifications from "@/pages/admin/Notifications"
import CommissionsPage from "@/components/commissions/CommissionsPage"
import { Suspense } from "react"
import { LoadingScreen } from "@/components/shared/LoadingScreen"

const RoleBasedLayout = () => {
  const { currentUserRole, checkPermission, isLoading } = usePermissions();
  
  if (isLoading) {
    return <LoadingScreen />;
  }

  // If we have a role, determine the appropriate layout
  if (currentUserRole?.name) {
    const roleName = currentUserRole.name.toLowerCase();
    console.log('Current role name:', roleName);
    
    switch (roleName) {
      case 'administrator':
        return <DashboardLayoutWrapper />;
      case 'staff':
      case 'technician':
        // Check if user has permission to access staff dashboard
        const hasStaffAccess = await checkPermission('staff_dashboard', 'page_access');
        if (!hasStaffAccess) {
          console.log('Staff access denied');
          return <Navigate to="/unauthorized" replace />;
        }
        console.log('Rendering StaffLayoutWrapper for role:', roleName);
        return <StaffLayoutWrapper />;
      case 'client':
        return <ClientLayoutWrapper />;
      default:
        console.log('Unknown role:', roleName);
        return <Navigate to="/unauthorized" replace />;
    }
  }

  // If we have no role but the hook has finished loading, redirect to auth
  console.log('No role found, redirecting to auth');
  return <Navigate to="/auth" replace />;
};

export const protectedRoutes: RouteObject = {
  path: "/",
  element: (
    <Suspense fallback={<LoadingScreen />}>
      <RoleBasedLayout />
    </Suspense>
  ),
  children: [
    {
      path: "",
      element: <Navigate to="/dashboard" replace />,
      index: true
    },
    {
      path: "dashboard",
      element: <Dashboard />,
    },
    {
      path: "chat",
      element: <Chat />,
    },
    {
      path: "notifications",
      element: <Notifications />,
    },
    {
      path: "commissions",
      element: <CommissionsPage />,
    },
    ...workOrderRoutes,
    ...serviceRoutes,
    ...userRoutes,
    ...estimateRoutes,
    ...invoiceRoutes,
    ...clientRoutes,
    ...settingsRoutes,
  ],
};
