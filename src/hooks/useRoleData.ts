
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export interface Role {
  id: string
  name: string
  nicename: string
  description?: string
  default_dashboard?: 'admin' | 'staff' | 'client'
}

export function useRoleData() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roles")
        .select("*")
        .order("nicename")

      if (error) {
        console.error("Error fetching roles:", error)
        throw error
      }

      return data as Role[]
    },
  })
}
