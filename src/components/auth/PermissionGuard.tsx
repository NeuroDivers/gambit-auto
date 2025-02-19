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
  const { checkPermission, currentUserRole, isRoleLoading } = usePermissions()

  useEffect(() => {
    const checkAccess = async () => {
      // If user is administrator, grant immediate access
      if (currentUserRole?.name?.toLowerCase() === 'administrator') {
        console.log('User is administrator, granting access');
        setHasPermission(true);
        return;
      }

      // Otherwise check specific permission
      const result = await checkPermission(resource, type);
      setHasPermission(result);
    }

    // Only check permissions if we have loaded the role information
    if (!isRoleLoading) {
      checkAccess();
    }
  }, [currentUserRole, resource, type, checkPermission, isRoleLoading])

  // Show loading screen while we're loading role information or checking permissions
  if (isRoleLoading || hasPermission === null) {
    return <LoadingScreen />
  }

  if (!hasPermission) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
