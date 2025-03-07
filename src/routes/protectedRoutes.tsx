
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
import { customerRoutes } from "./customer-routes"
import { settingsRoutes } from "./settings-routes"
import { vehicleRoutes } from "./vehicle-routes"
import { bookingRoutes } from "./booking-routes"
import { usePermissions } from "@/hooks/usePermissions"
import { Navigate } from "react-router-dom"
import Chat from "@/pages/admin/Chat"
import Notifications from "@/pages/admin/Notifications"
import CommissionsPage from "@/components/commissions/CommissionsPage"
import ServiceSkills from "@/pages/staff/ServiceSkills"
import { Suspense, useEffect } from "react"
import { LoadingScreen } from "@/components/shared/LoadingScreen"
import { applyThemeClass } from "@/lib/utils"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"

const RoleBasedLayout = () => {
  const { currentUserRole, isLoading, error } = usePermissions();
  
  // Apply saved theme when dashboard is loaded
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      console.log("Dashboard: Loading saved theme:", savedTheme)
      applyThemeClass(savedTheme, null)
    }
  }, [])
  
  // Handle case where user is loading for too long (potential redirect loop)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isLoading) {
      timeoutId = setTimeout(() => {
        console.log('Loading timeout reached, may be in redirect loop');
        // If still loading after 10 seconds, consider it a problem
        toast.error('System access issue', {
          description: 'Unable to determine your access level. Logging out for security.',
        });
        
        setTimeout(async () => {
          try {
            await supabase.auth.signOut();
            window.location.href = '/auth';
          } catch (err) {
            console.error('Error during forced signout:', err);
            window.location.href = '/auth';
          }
        }, 2000);
      }, 10000); // 10 seconds timeout
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading]);
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  // If there's an error or no role found, show a more informative message in console
  if (error || !currentUserRole) {
    console.error('Role determination error:', error || 'No role found for user');
    console.log('Current user role state:', { currentUserRole, error });
    return <Navigate to="/auth" replace />;
  }

  console.log('Current role for layout determination:', currentUserRole);
  
  // Determine which layout to show based on the default_dashboard property
  if (currentUserRole?.default_dashboard) {
    switch (currentUserRole.default_dashboard) {
      case 'admin':
        return <DashboardLayoutWrapper />;
      case 'staff':
        return <StaffLayoutWrapper />;
      case 'client':
        return <ClientLayoutWrapper />;
      default:
        console.log('Unrecognized default_dashboard value:', currentUserRole.default_dashboard);
        // Fall through to default case
    }
  } else {
    // If no default_dashboard is set, try to determine from role name
    const roleName = currentUserRole.name.toLowerCase();
    if (roleName === 'administrator' || roleName === 'admin' || roleName === 'king') {
      return <DashboardLayoutWrapper />;
    } else if (roleName === 'staff' || roleName === 'knight' || roleName === 'rook' || roleName === 'trainee') {
      return <StaffLayoutWrapper />;
    }
  }

  // Default to client layout if we couldn't determine anything else
  console.log('No specific layout determined, using client dashboard');
  return <ClientLayoutWrapper />;
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
      path: "staff/service-skills",
      element: <ServiceSkills />,
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
    ...customerRoutes,
    ...settingsRoutes,
    ...vehicleRoutes,
    ...bookingRoutes,
  ],
};
