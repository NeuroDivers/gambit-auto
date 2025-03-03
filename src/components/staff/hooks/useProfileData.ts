
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { ProfileData } from "../types/staff"

export function useProfileData(profileId: string) {
  return useQuery({
    queryKey: ["profile_data", profileId],
    queryFn: async () => {
      if (!profileId) throw new Error("Profile ID is required")
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .single()

      if (error) {
        console.error("Error fetching profile data:", error)
        throw error
      }

      return data as ProfileData
    },
    enabled: !!profileId,
  })
}
