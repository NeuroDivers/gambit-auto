import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export function useServiceData() {
  return useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("id, name, price")
        .eq("status", "active")
      
      if (error) throw error
      return data
    }
  })
}