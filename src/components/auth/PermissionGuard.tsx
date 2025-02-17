
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
  id: string
  name: string
  nicename: string
}

interface ProfileData {
  id: string
  role: UserRole
}

export function PermissionGuard({ children, resource, type }: PermissionGuardProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const { checkPermission } = usePermissions()

  // Get current user's role
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['current-user-role'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data } = await supabase
        .from('profiles')
        .select(`
          id,
          role:role_id (
            id,
            name,
            nicename
          )
        `)
        .eq('id', user.id)
        .single()

      console.log('Profile data:', data)
      return data as ProfileData
    }
  })

  useEffect(() => {
    const checkAccess = async () => {
      // If user is administrator, grant immediate access
      if (profile?.role?.name?.toLowerCase() === 'administrator') {
        console.log('User is admin, granting access')
        setHasPermission(true)
        return
      }

      // Otherwise check specific permission
      const result = await checkPermission(resource, type)
      setHasPermission(result)
    }

    if (profile) {
      checkAccess()
    }
  }, [profile, resource, type, checkPermission])

  if (isLoadingProfile || hasPermission === null) {
    return <LoadingScreen />
  }

  if (!hasPermission) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
