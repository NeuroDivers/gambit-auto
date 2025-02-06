import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useEffect } from "react"

export function useSidekicks() {
  const queryClient = useQueryClient()

  const { data: sidekicks } = useQuery({
    queryKey: ["sidekicks"],
    queryFn: async () => {
      console.log("Fetching sidekicks...")
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "sidekick")

      if (rolesError) {
        console.error("Error fetching sidekick roles:", rolesError)
        throw rolesError
      }

      const userIds = userRoles.map(role => role.user_id)

      if (userIds.length === 0) {
        console.log("No sidekick roles found")
        return []
      }

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", userIds)

      if (profilesError) {
        console.error("Error fetching sidekick profiles:", profilesError)
        throw profilesError
      }

      console.log("Fetched sidekicks:", profiles)
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
          filter: `role=eq.sidekick`
        },
        () => {
          console.log("Sidekick roles changed, invalidating query...")
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