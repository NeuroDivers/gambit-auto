
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

const RoleBasedLayout = () => {
  const { currentUserRole, isLoading } = usePermissions();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }

  const role = currentUserRole?.name?.toLowerCase();
  
  switch (role) {
    case 'administrator':
      return <DashboardLayoutWrapper />;
    case 'staff':
      return <StaffLayoutWrapper />;
    case 'client':
      return <ClientLayoutWrapper />;
    default:
      return <Navigate to="/auth" replace />;
  }
};

export const protectedRoutes: RouteObject = {
  path: "/",
  element: <RoleBasedLayout />,
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
    ...workOrderRoutes,
    ...serviceRoutes,
    ...userRoutes,
    ...estimateRoutes,
    ...invoiceRoutes,
    ...clientRoutes,
    ...settingsRoutes,
  ],
};
