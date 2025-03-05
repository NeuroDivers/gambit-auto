
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { ServiceType } from "@/integrations/supabase/types/service-types"

export function useServiceTypes() {
  return useQuery({
    queryKey: ["service-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("*")
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching services:', error)
        throw error
      }
      
      return data as ServiceType[] || []
    },
  })
}
