
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { StaffMember } from "../types/staff"

export function useStaffData() {
  return useQuery({
    queryKey: ["staff_members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff_view")
        .select("*")
        .order("last_name")

      if (error) {
        console.error("Error fetching staff data:", error)
        throw error
      }

      return data as StaffMember[]
    },
  })
}
