
import { ReactNode, useEffect, useState } from "react"
import { usePermissions } from "@/hooks/usePermissions"
import { Navigate } from "react-router-dom"
import { LoadingScreen } from "../shared/LoadingScreen"
import { toast } from "sonner"

interface PermissionGuardProps {
  children: ReactNode
  resource: string
  type: 'page_access' | 'feature_access'
}

export function PermissionGuard({ children, resource, type }: PermissionGuardProps) {
  // TEMPORARY DEBUG: Adding debugging mode to bypass permission checks
  const debugMode = true; // Set to true to bypass permission checks

  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [redirecting, setRedirecting] = useState(false)
  const { checkPermission, currentUserRole, isLoading, error } = usePermissions()

  // Add debug logging to help troubleshoot permission issues
  console.log(`PermissionGuard checking for ${resource} with type ${type}`)
  console.log(`PermissionGuard currentUserRole:`, currentUserRole)
  console.log(`PermissionGuard isLoading:`, isLoading)
  console.log(`PermissionGuard error:`, error)

  useEffect(() => {
    // TEMPORARILY GRANT ALL PERMISSIONS FOR DEBUGGING
    if (debugMode) {
      console.log(`DEBUG MODE: Bypassing permission check for ${resource}`);
      setHasPermission(true);
      return;
    }

    const checkAccess = async () => {
      // If still loading, don't check permissions yet
      if (isLoading) {
        console.log(`PermissionGuard: Still loading role data, waiting...`);
        return;
      }

      // If user has role determination error, force sign out
      if (error) {
        console.error('Permission check error:', error);
        if (!redirecting) {
          setRedirecting(true);
          toast.error('Authentication error', {
            description: 'Your account has been deleted or is invalid. Signing out.',
          });
          
          // Redirect to clear auth page
          window.location.href = '/clear-auth';
          return;
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
          
          // Redirect to clear auth page
          window.location.href = '/clear-auth';
          return;
        }
        return;
      }

      const roleName = currentUserRole.name.toLowerCase();
      console.log('Checking permissions for role:', roleName, 'resource:', resource);

      // Special case for dashboard - always grant access
      if (resource === 'dashboard') {
        console.log('Dashboard access granted - all users can access dashboard');
        setHasPermission(true);
        return;
      }

      // Admin/King always have access to everything
      if (roleName === 'administrator' || roleName === 'king' || roleName === 'admin') {
        console.log('User is admin/king, granting access to:', resource);
        setHasPermission(true);
        return;
      }

      try {
        // Check specific permission
        const result = await checkPermission(resource, type);
        console.log(`Permission check result for ${resource}: ${result}`);
        setHasPermission(result);
      } catch (err) {
        console.error(`Error checking permission for ${resource}:`, err);
        // Temporary fallback - grant access to avoid blank screens
        // This can be removed once permissions are working properly
        console.log(`FALLBACK: Granting temporary access to ${resource} due to error`);
        setHasPermission(true);
      }
    }

    checkAccess();
  }, [currentUserRole, isLoading, resource, type, checkPermission, redirecting, error, debugMode]);

  // Show loading screen while checking permissions
  if (isLoading || hasPermission === null || redirecting) {
    console.log(`PermissionGuard: Showing loading screen for ${resource}`);
    return <LoadingScreen />;
  }

  // Redirect to unauthorized if no permission
  if (!hasPermission) {
    console.log(`PermissionGuard: No permission for ${resource}, redirecting to /unauthorized`);
    return <Navigate to="/unauthorized" replace />;
  }

  console.log(`PermissionGuard: Access granted for ${resource}`);
  return <>{children}</>;
}
