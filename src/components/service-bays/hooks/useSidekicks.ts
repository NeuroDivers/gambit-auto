
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useEffect } from "react"

export function useSidekicks() {
  const queryClient = useQueryClient()

  const { data: sidekicks } = useQuery({
    queryKey: ["sidekicks"],
    queryFn: async () => {
      console.log("Fetching sidekicks...")
      
      // First get all users with knights role
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "knights")

      if (rolesError) {
        console.error("Error fetching knights roles:", rolesError)
        throw rolesError
      }

      if (userRoles.length === 0) {
        console.log("No knights roles found")
        return []
      }

      const userIds = userRoles.map(role => role.user_id)

      // Then get the corresponding profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", userIds)

      if (profilesError) {
        console.error("Error fetching knights profiles:", profilesError)
        throw profilesError
      }

      console.log("Fetched knights:", profiles)
      return profiles
    },
  })

  useEffect(() => {
    const rolesChannel = supabase
      .channel('roles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles',
          filter: `role=eq.knights`
        },
        () => {
          console.log("Knights roles changed, invalidating query...")
          queryClient.invalidateQueries({ queryKey: ["sidekicks"] })
        }
      )
      .subscribe()

    const profilesChannel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          console.log("Profiles changed, invalidating query...")
          queryClient.invalidateQueries({ queryKey: ["sidekicks"] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(rolesChannel)
      supabase.removeChannel(profilesChannel)
    }
  }, [queryClient])

  return { sidekicks }
}
