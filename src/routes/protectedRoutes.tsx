
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
  const { currentUserRole, isLoading } = usePermissions();
  
  if (isLoading) {
    return <LoadingScreen />;
  }

  // If we have a role, determine the appropriate layout based on default_dashboard setting
  if (currentUserRole?.name) {
    console.log('Current role:', currentUserRole);
    
    // Use the default_dashboard setting to determine which layout to show
    switch (currentUserRole.default_dashboard) {
      case 'admin':
        return <DashboardLayoutWrapper />;
      case 'staff':
        return <StaffLayoutWrapper />;
      case 'client':
        return <ClientLayoutWrapper />;
      default:
        // If no default_dashboard is set, fallback to client dashboard
        console.log('No default dashboard set, using client dashboard');
        return <ClientLayoutWrapper />;
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
