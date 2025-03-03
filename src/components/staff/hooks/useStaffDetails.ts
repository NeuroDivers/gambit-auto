
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { StaffDetails } from "../types/staff"

export function useStaffDetails(staffId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["staff_details", staffId],
    queryFn: async () => {
      if (!staffId) return null
      
      const { data, error } = await supabase
        .from("staff")
        .select("*")
        .eq("id", staffId)
        .single()

      if (error) {
        console.error("Error fetching staff details:", error)
        throw error
      }

      return data as StaffDetails
    },
    enabled: !!staffId,
  })

  return {
    staffDetails: data,
    isLoading,
    error,
  }
}
