
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useEffect } from "react"

interface Role {
  id: string;
  name: string;
  nicename: string;
}

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: Role | null;
}

export function useAssignableProfiles() {
  const queryClient = useQueryClient()

  const { data: profiles } = useQuery({
    queryKey: ["assignable-profiles"],
    queryFn: async () => {
      console.log("Fetching assignable profiles...")
      
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          id, 
          first_name, 
          last_name,
          role:role_id (
            id,
            name,
            nicename
          )
        `)
        .not('role_id', 'is', null);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError)
        throw profilesError
      }

      console.log("Fetched profiles:", profiles)
      return profiles as Profile[];
    },
  })

  useEffect(() => {
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
          queryClient.invalidateQueries({ queryKey: ["assignable-profiles"] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(profilesChannel)
    }
  }, [queryClient])

  return { profiles }
}
