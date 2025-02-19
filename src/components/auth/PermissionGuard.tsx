
import { ReactNode, useEffect, useState } from "react"
import { usePermissions } from "@/hooks/usePermissions"
import { Navigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { LoadingScreen } from "../shared/LoadingScreen"

interface PermissionGuardProps {
  children: ReactNode
  resource: string
  type: 'page_access' | 'feature_access'
}

interface UserRole {
  role_name: string;
  role_nicename: string;
  user_type: string;
}

export function PermissionGuard({ children, resource, type }: PermissionGuardProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const { checkPermission } = usePermissions()

  // Get current user's role and type
  const { data: userRole, isLoading: isLoadingRole } = useQuery({
    queryKey: ['current-user-role'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .rpc('get_user_role', {
          user_id: user.id
        })
        .single()

      if (error) {
        console.error('Error fetching user role:', error)
        return null
      }

      console.log('User role data:', data)
      return data as UserRole
    }
  })

  useEffect(() => {
    const checkAccess = async () => {
      // If user is an administrator, grant immediate access
      if (userRole?.role_name?.toLowerCase() === 'administrator') {
        console.log('User is admin, granting access')
        setHasPermission(true)
        return
      }

      // If user is a client, check if resource is in allowed client resources
      if (userRole?.user_type === 'client') {
        const clientResources = ['client_dashboard', 'quotes', 'invoices', 'vehicles', 'bookings']
        const hasAccess = clientResources.includes(resource)
        console.log(`Client access to ${resource}:`, hasAccess)
        setHasPermission(hasAccess)
        return
      }

      // For staff members, check specific permission
      if (userRole?.user_type === 'staff') {
        const result = await checkPermission(resource, type)
        console.log(`Staff permission check for ${resource}:`, result)
        setHasPermission(result)
        return
      }

      // If no role found, deny access
      console.log('No role found, denying access')
      setHasPermission(false)
    }

    if (userRole) {
      checkAccess()
    }
  }, [userRole, resource, type, checkPermission])

  if (isLoadingRole || hasPermission === null) {
    return <LoadingScreen />
  }

  if (!hasPermission) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
