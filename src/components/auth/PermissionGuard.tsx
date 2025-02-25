
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

      // If user is administrator, grant immediate access
      if (currentUserRole.name.toLowerCase() === 'administrator') {
        console.log('User is admin, granting access');
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

  // Redirect to auth if no permission
  if (!hasPermission) {
    console.log('No permission, redirecting to /auth')
    return <Navigate to="/auth" replace />
  }

  return <>{children}</>
}
