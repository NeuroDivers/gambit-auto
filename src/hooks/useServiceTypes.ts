
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { ServiceType } from "@/integrations/supabase/types/service-types"

export function useServiceTypes() {
  return useQuery({
    queryKey: ["service-types"],
    queryFn: async () => {
      console.log("Fetching service types...")
      
      try {
        const { data, error } = await supabase
          .from("service_types")
          .select("*")
          .order('name', { ascending: true })
  
        if (error) {
          console.error('Error fetching services:', error)
          throw error
        }
        
        console.log("Fetched service types:", data ? data.length : 0)
        // Always return an array, never undefined
        return (data || []) as ServiceType[]
      } catch (err) {
        console.error("Error in useServiceTypes:", err)
        return [] as ServiceType[]
      }
    },
    // Always return an empty array as initial data
    initialData: [] as ServiceType[],
  })
}
