
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { ServiceBay } from "@/components/service-bays/hooks/useServiceBays"

export const useServiceBays = () => {
  return useQuery({
    queryKey: ["serviceBays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_bays")
        .select("*")
        .order("name")
      
      if (error) throw error
      return data as ServiceBay[]
    }
  })
}
