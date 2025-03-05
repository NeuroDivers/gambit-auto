
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { ServiceType } from "@/types/service-type"

export function useServiceTypes() {
  return useQuery({
    queryKey: ["serviceTypes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("*")
        .eq("is_active", true)
        .order("name")

      if (error) {
        console.error("Error fetching service types:", error)
        throw error
      }

      return data as ServiceType[]
    },
  })
}
