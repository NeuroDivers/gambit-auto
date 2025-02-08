
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useEffect } from "react"

interface Role {
  name: string;
}

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: Role | null;
}

export function useSidekicks() {
  const queryClient = useQueryClient()

  const { data: sidekicks } = useQuery({
    queryKey: ["sidekicks"],
    queryFn: async () => {
      console.log("Fetching sidekicks...")
      
      // Get profiles where role name is 'knights'
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          id, 
          first_name, 
          last_name,
          role:role_id (
            name
          )
        `)
        .not('role_id', 'is', null);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError)
        throw profilesError
      }

      // Filter profiles to only include knights
      const knightProfiles = (profiles as Profile[]).filter(
        profile => profile.role?.name?.toLowerCase() === 'knights'
      );

      console.log("Fetched knights:", knightProfiles)
      return knightProfiles
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
          queryClient.invalidateQueries({ queryKey: ["sidekicks"] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(profilesChannel)
    }
  }, [queryClient])

  return { sidekicks }
}
