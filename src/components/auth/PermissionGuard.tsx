
import { ReactNode, useEffect, useState } from "react"
import { usePermissions } from "@/hooks/usePermissions"
import { Navigate } from "react-router-dom"
import { LoadingScreen } from "../shared/LoadingScreen"

interface PermissionGuardProps {
  children: ReactNode
  resource: string
  type: 'page_access' | 'feature_access'
}

export function PermissionGuard({ children, resource, type }: PermissionGuardProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const { checkPermission, currentUserRole, isLoading } = usePermissions()

  useEffect(() => {
    const checkAccess = async () => {
      // If still loading, don't check permissions yet
      if (isLoading) return;

      // If no role found, deny access
      if (!currentUserRole) {
        console.log('No role found, denying access');
        setHasPermission(false);
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
  }, [currentUserRole, isLoading, resource, type, checkPermission])

  // Show loading screen while checking permissions
  if (isLoading || hasPermission === null) {
    return <LoadingScreen />
  }

  // Redirect to unauthorized if no permission
  if (!hasPermission) {
    console.log('No permission, redirecting to /unauthorized')
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
