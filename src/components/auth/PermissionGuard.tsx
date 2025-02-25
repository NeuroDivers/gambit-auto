
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

// Define the exact shape of the Supabase response
interface SupabaseProfileResponse {
  id: string
  role: {
    id: string
    name: string
    nicename: string
  }
}

export function PermissionGuard({ children, resource, type }: PermissionGuardProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const { checkPermission } = usePermissions()

  // Get current user's role
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['current-user-role'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('No user found in PermissionGuard')
        return null
      }

      const { data, error } = await supabase
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
        .single<SupabaseProfileResponse>()

      if (error || !data) {
        console.log('No profile found in PermissionGuard')
        return null
      }

      // Transform the data to match our expected type
      const transformedData: ProfileData = {
        id: data.id,
        role: {
          id: data.role.id,
          name: data.role.name,
          nicename: data.role.nicename
        }
      }
      console.log('Profile data in PermissionGuard:', transformedData)
      return transformedData
    },
    staleTime: 30000, // Cache for 30 seconds
    retry: 3
  })

  useEffect(() => {
    const checkAccess = async () => {
      if (!profile) {
        console.log('No profile available, denying access')
        setHasPermission(false)
        return
      }

      // If user is administrator, grant immediate access
      if (profile.role.name.toLowerCase() === 'administrator') {
        console.log('User is admin in PermissionGuard, granting access')
        setHasPermission(true)
        return
      }

      // Otherwise check specific permission
      const result = await checkPermission(resource, type)
      console.log(`Permission check result for ${resource}: ${result}`)
      setHasPermission(result)
    }

    if (!isLoadingProfile) {
      checkAccess()
    }
  }, [profile, isLoadingProfile, resource, type, checkPermission])

  // Show loading screen while checking permissions
  if (isLoadingProfile || hasPermission === null) {
    return <LoadingScreen />
  }

  // Redirect to auth if no permission
  if (!hasPermission) {
    console.log('No permission, redirecting to /auth')
    return <Navigate to="/auth" replace />
  }

  return <>{children}</>
}
