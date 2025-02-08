
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export function useServiceData() {
  return useQuery({
    queryKey: ["services-with-packages"],
    queryFn: async () => {
      const { data: services, error } = await supabase
        .from("service_types")
        .select(`
          id, 
          name, 
          price,
          service_packages (
            id,
            name,
            description,
            price,
            status
          )
        `)
        .eq("status", "active")
      
      if (error) throw error
      return services
    }
  })
}
