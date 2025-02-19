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

interface SupabaseProfileResponse {
  id: string
  role: UserRole[]
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
          role:role_id!inner (
            id,
            name,
            nicename
          )
        `)
        .eq('id', user.id)
        .single()

      // Transform the data to match our expected type
      if (data) {
        const supabaseData = data as SupabaseProfileResponse
        // Since role is an array, take the first role (assuming there's only one)
        if (supabaseData.role && supabaseData.role.length > 0) {
          const transformedData: ProfileData = {
            id: supabaseData.id,
            role: {
              id: supabaseData.role[0].id,
              name: supabaseData.role[0].name,
              nicename: supabaseData.role[0].nicename
            }
          }
          console.log('Transformed profile data:', transformedData)
          return transformedData
        }
      }
      return null
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
