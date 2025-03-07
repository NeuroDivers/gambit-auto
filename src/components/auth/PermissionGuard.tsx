
import { ReactNode, useEffect, useState } from "react"
import { usePermissions } from "@/hooks/usePermissions"
import { Navigate } from "react-router-dom"
import { LoadingScreen } from "../shared/LoadingScreen"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"

interface PermissionGuardProps {
  children: ReactNode
  resource: string
  type: 'page_access' | 'feature_access'
}

export function PermissionGuard({ children, resource, type }: PermissionGuardProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [redirecting, setRedirecting] = useState(false)
  const { checkPermission, currentUserRole, isLoading, error } = usePermissions()

  useEffect(() => {
    const checkAccess = async () => {
      // If still loading, don't check permissions yet
      if (isLoading) return;

      // If user has role determination error, force sign out
      if (error) {
        console.error('Permission check error:', error);
        if (!redirecting) {
          setRedirecting(true);
          toast.error('Authentication error', {
            description: 'Your account has been deleted or is invalid. Signing out.',
          });
          
          // Force sign out with a short delay to allow the toast to be seen
          setTimeout(async () => {
            try {
              await supabase.auth.signOut();
              // Clear all Supabase related tokens from localStorage
              localStorage.removeItem('sb-yxssuhzzmxwtnaodgpoq-auth-token');
              localStorage.removeItem('supabase.auth.token');
              // Remove any other auth related items
              localStorage.removeItem('supabase-auth-token');
              
              // Force a page reload to clear the application state
              window.location.href = '/auth';
            } catch (signOutError) {
              console.error('Error signing out:', signOutError);
              // If sign out fails, force redirect to auth page
              window.location.href = '/auth';
            }
          }, 2000);
        }
        return;
      }

      // If no role found, deny access
      if (!currentUserRole) {
        console.log('No role found, denying access');
        setHasPermission(false);
        
        // If role is missing, something is wrong with the account setup
        // Show toast and redirect to auth
        if (!redirecting) {
          setRedirecting(true);
          toast.error('Access denied', {
            description: 'Your account has insufficient permissions. Signing out.',
          });
          
          setTimeout(async () => {
            try {
              await supabase.auth.signOut();
              // Clear all auth tokens
              localStorage.removeItem('sb-yxssuhzzmxwtnaodgpoq-auth-token');
              localStorage.removeItem('supabase.auth.token');
              localStorage.removeItem('supabase-auth-token');
              
              window.location.href = '/auth';
            } catch (signOutError) {
              console.error('Error signing out:', signOutError);
              window.location.href = '/auth';
            }
          }, 2000);
        }
        return;
      }

      const roleName = currentUserRole.name.toLowerCase();
      console.log('Checking permissions for role:', roleName);

      // If the resource is dashboard, grant access to all authenticated users
      if (resource === 'dashboard') {
        console.log('Dashboard access granted - all users can access dashboard');
        setHasPermission(true);
        return;
      }

      // If user is administrator or king, grant immediate access
      if (roleName === 'administrator' || roleName === 'king') {
        console.log('User is admin or king, granting access');
        setHasPermission(true);
        return;
      }

      // Check specific permission
      const result = await checkPermission(resource, type)
      console.log(`Permission check result for ${resource}: ${result}`)
      setHasPermission(result)
    }

    checkAccess()
  }, [currentUserRole, isLoading, resource, type, checkPermission, redirecting, error])

  // Show loading screen while checking permissions
  if (isLoading || hasPermission === null || redirecting) {
    return <LoadingScreen />
  }

  // Redirect to unauthorized if no permission
  if (!hasPermission) {
    console.log('No permission, redirecting to /unauthorized')
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
