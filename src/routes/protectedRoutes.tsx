import { DashboardLayoutWrapper } from "@/components/dashboard/DashboardLayoutWrapper"
import { StaffLayoutWrapper } from "@/components/staff/StaffLayoutWrapper"
import { ClientLayoutWrapper } from "@/components/client/ClientLayoutWrapper"
import Dashboard from "@/pages/dashboard/Dashboard"
import { RouteObject } from "react-router-dom"
import { workOrderRoutes } from "./work-order-routes"
import { userRoutes } from "./user-routes"
import { estimateRoutes } from "./estimate-routes"
import { invoiceRoutes } from "./invoice-routes"
import { customerRoutes } from "./customer-routes"
import { settingsRoutes } from "./settings-routes"
import { vehicleRoutes } from "./vehicle-routes"
import { bookingRoutes } from "./booking-routes"
import { serviceRoutes } from "./service-routes"
import { usePermissions } from "@/hooks/usePermissions"
import { Navigate } from "react-router-dom"
import Chat from "@/pages/admin/Chat"
import Notifications from "@/pages/admin/Notifications"
import CommissionsPage from "@/components/commissions/CommissionsPage"
import ServiceSkills from "@/pages/staff/ServiceSkills"
import { Suspense, useEffect, useState } from "react"
import { LoadingScreen } from "@/components/shared/LoadingScreen"
import { applyThemeClass } from "@/lib/utils"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"

const RoleBasedLayout = () => {
  const { currentUserRole, isLoading: roleLoading, error: roleError } = usePermissions();
  const [redirectInProgress, setRedirectInProgress] = useState(false);
  const [forcedSignOut, setForcedSignOut] = useState(false);
  const [loadingTimeoutReached, setLoadingTimeoutReached] = useState(false);
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      console.log("Dashboard: Loading saved theme:", savedTheme)
      applyThemeClass(savedTheme, null)
    }
  }, [])
  
  const redirectToClearAuth = () => {
    console.log('Redirecting to clear auth page');
    window.location.href = '/clear-auth';
  };
  
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (roleLoading && !redirectInProgress && !forcedSignOut) {
      timeoutId = setTimeout(() => {
        console.log('Loading timeout reached, may be in redirect loop');
        setLoadingTimeoutReached(true);
        toast.error('System access issue', {
          description: 'Unable to determine your access level. Logging out for security.',
        });
        
        setRedirectInProgress(true);
        redirectToClearAuth();
      }, 5000); // 5 seconds timeout
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [roleLoading, redirectInProgress, forcedSignOut]);

  useEffect(() => {
    if (roleError && !redirectInProgress && !forcedSignOut) {
      console.error('Role determination error detected:', roleError);
      
      toast.error('Authentication error', {
        description: 'Your account has an authentication issue. Signing you out.',
      });
      
      setRedirectInProgress(true);
      
      setTimeout(() => {
        redirectToClearAuth();
      }, 2000);
    }
  }, [roleError, redirectInProgress, forcedSignOut]);

  useEffect(() => {
    if (!roleLoading && !redirectInProgress && !forcedSignOut && !currentUserRole) {
      console.error('No role found for user after loading completed');
      
      toast.error('Access denied', {
        description: 'Your account has no assigned role or has been deleted. Logging you out for security.',
      });
      
      setRedirectInProgress(true);
      
      setTimeout(() => {
        redirectToClearAuth();
      }, 2000);
    }
  }, [roleLoading, currentUserRole, redirectInProgress, forcedSignOut]);
  
  if (loadingTimeoutReached) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
        <h1 className="text-2xl font-bold mb-4">Authentication Issue Detected</h1>
        <p className="mb-6 text-center max-w-md">
          We're having trouble determining your access level. This may be because your user account has been deleted.
        </p>
        <button 
          onClick={redirectToClearAuth}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Clear Authentication & Sign Out
        </button>
      </div>
    );
  }
  
  if (forcedSignOut || redirectInProgress) {
    return <LoadingScreen />;
  }
  
  if (roleLoading) {
    return <LoadingScreen />;
  }
  
  if (roleError || !currentUserRole) {
    return <LoadingScreen />;
  }

  console.log('Current role for layout determination:', currentUserRole);
  
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
    const roleName = currentUserRole.name.toLowerCase();
    if (roleName === 'administrator' || roleName === 'admin' || roleName === 'king') {
      return <DashboardLayoutWrapper />;
    } else if (roleName === 'staff' || roleName === 'knight' || roleName === 'rook' || roleName === 'trainee') {
      return <StaffLayoutWrapper />;
    }
  }

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
